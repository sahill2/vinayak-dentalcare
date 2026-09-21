const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const app = require('../backend/server');
const connectDB = require('../backend/config/db');
const Admin = require('../backend/models/Admin');
const Appointment = require('../backend/models/Appointment');
const RateLimit = require('../backend/models/RateLimit');

async function runTests() {
  console.log('--- Starting Vinayak Dental Care Integration Test Suite ---');
  let passed = 0;
  let failed = 0;

  await connectDB();
  await RateLimit.deleteMany({});

  const assert = (condition, name) => {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const resHealth = await request(app).get('/api/health');
    assert(resHealth.status === 200 && resHealth.body.ok === true && resHealth.body.db === 'up', 'GET /api/health returns 200 with db status up');

    // 2. Static File Isolation: Sensitive files must return 404
    const resServerJs = await request(app).get('/backend/server.js');
    assert(resServerJs.status === 404, 'Direct access to /backend/server.js returns 404');

    const resPkgJson = await request(app).get('/package.json');
    assert(resPkgJson.status === 404, 'Direct access to /package.json returns 404');

    const resVercelJson = await request(app).get('/vercel.json');
    assert(resVercelJson.status === 404, 'Direct access to /vercel.json returns 404');

    // 3. Protected Dashboard: Unauthenticated access returns 302 redirect
    const resDashboard = await request(app).get('/dashboard.html');
    assert(resDashboard.status === 302 && resDashboard.headers.location === '/admin/index.html', 'Unauthenticated GET /dashboard.html returns 302 redirect to /admin/index.html');

    // 4. Appointment Booking Validations
    // Missing consent -> 400
    const resConsent = await request(app).post('/api/appointments').send({
      patientName: 'Test Patient',
      phone: '9876543210',
      service: 'General Dental Checkup',
      date: '2026-09-23',
      timeSlot: '10:30 AM - 11:30 AM',
      consentGiven: false
    });
    assert(resConsent.status === 400, 'POST /api/appointments with consentGiven: false returns 400');

    // Sunday date (2026-09-27 is Sunday) -> 400
    const resSunday = await request(app).post('/api/appointments').send({
      patientName: 'Test Patient',
      phone: '9876543210',
      service: 'General Dental Checkup',
      date: '2026-09-27',
      timeSlot: '10:30 AM - 11:30 AM',
      consentGiven: true
    });
    assert(resSunday.status === 400, 'POST /api/appointments on Sunday returns 400');

    // Past date -> 400
    const resPast = await request(app).post('/api/appointments').send({
      patientName: 'Test Patient',
      phone: '9876543210',
      service: 'General Dental Checkup',
      date: '2020-01-01',
      timeSlot: '10:30 AM - 11:30 AM',
      consentGiven: true
    });
    assert(resPast.status === 400, 'POST /api/appointments with past date returns 400');

    // Invalid time slot -> 400
    const resInvalidSlot = await request(app).post('/api/appointments').send({
      patientName: 'Test Patient',
      phone: '9876543210',
      service: 'General Dental Checkup',
      date: '2026-09-23',
      timeSlot: '02:00 AM - 03:00 AM',
      consentGiven: true
    });
    assert(resInvalidSlot.status === 400, 'POST /api/appointments with invalid timeSlot returns 400');

    // 5. Secure Status Lookup
    // Lookup with partial / single digit phone "9" -> 404
    const resLookupPartial = await request(app).post('/api/appointments/lookup').send({
      referenceCode: 'VDC-999999',
      phone: '9'
    });
    assert(resLookupPartial.status === 404, 'POST /api/appointments/lookup with phone "9" returns 404');

    // 6. Public Availability Endpoint
    const resAvail = await request(app).get('/api/appointments/availability?date=2026-09-23');
    assert(resAvail.status === 200 && Array.isArray(resAvail.body.data.takenSlots), 'GET /api/appointments/availability returns 200 with takenSlots array');

    // 7. Booking & Double-Booking Race Condition Prevention (201 & 409)
    // Clean up rate limits and test appointments for this slot
    await RateLimit.deleteMany({});
    const testDate = '2026-10-15';
    const testSlot = '04:00 PM - 05:00 PM';
    await Appointment.deleteMany({ date: testDate, timeSlot: testSlot });

    const resBook1 = await request(app).post('/api/appointments').send({
      patientName: 'Integration Tester',
      phone: '9876543210',
      email: 'test@example.com',
      service: 'General Dental Checkup',
      date: testDate,
      timeSlot: testSlot,
      consentGiven: true
    });
    assert(resBook1.status === 201 && resBook1.body.data.referenceCode.startsWith('VDC-'), 'First booking on available slot returns 201 with VDC-XXXXXX reference code');

    // Second booking on exact same slot -> 409 Conflict
    const resBook2 = await request(app).post('/api/appointments').send({
      patientName: 'Concurrent Tester',
      phone: '9876543211',
      email: 'test2@example.com',
      service: 'Dental Implants',
      date: testDate,
      timeSlot: testSlot,
      consentGiven: true
    });
    assert(resBook2.status === 409, 'Concurrent booking on identical date/slot returns 409 Conflict');

    // 8. Lookup previously booked appointment using mobile number only
    const resLookupValid = await request(app).post('/api/appointments/lookup').send({
      phone: '9876543210'
    });
    assert(resLookupValid.status === 200 && resLookupValid.body.data.date === testDate, 'POST /api/appointments/lookup returns 200 and appointment data for phone number only');

    // 9. Availability now includes the booked slot
    const resAvailUpdated = await request(app).get(`/api/appointments/availability?date=${testDate}`);
    assert(resAvailUpdated.status === 200 && resAvailUpdated.body.data.takenSlots.includes(testSlot), 'GET /api/appointments/availability now lists the booked slot as taken');

    // Clean up test appointment
    await Appointment.deleteMany({ date: testDate, timeSlot: testSlot });

    // 10. Admin Account Lockout after 5 failed login attempts
    await RateLimit.deleteMany({});
    const testAdminEmail = 'lockout-test@vinayakdentalcare.com';
    await Admin.deleteMany({ email: testAdminEmail });
    await Admin.create({
      id: 9999,
      email: testAdminEmail,
      password: 'InitialPassword123!',
      failedLoginAttempts: 0,
      lockUntil: null
    });

    for (let i = 0; i < 4; i++) {
      await request(app).post('/api/auth/login').send({
        email: testAdminEmail,
        password: 'WrongPassword!'
      });
    }
    const resFifthAttempt = await request(app).post('/api/auth/login').send({
      email: testAdminEmail,
      password: 'WrongPassword!'
    });
    assert(resFifthAttempt.status === 429 && resFifthAttempt.body.message.includes('locked'), 'Admin login locks account with 429 after 5 failed attempts');

    // Clean up test admin
    await Admin.deleteMany({ email: testAdminEmail });
    await RateLimit.deleteMany({});

    console.log(`\n--- Test Results: ${passed} Passed, ${failed} Failed ---`);
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
