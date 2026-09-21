const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAvailability,
  lookupAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getActivityLogs
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { mongoRateLimit, checkHoneypot } = require('../middleware/rateLimiter');

// Rate limiting: POST /api/appointments: 5 / hour per IP
const bookingLimiter = mongoRateLimit({
  prefix: 'booking_ip',
  max: 5,
  windowSec: 60 * 60,
  message: 'You have reached the maximum number of appointment requests for this hour. Please try again later or call the clinic.'
});

// Rate limiting: Lookup: 5 / 15 min per IP and per phone
const lookupIpLimiter = mongoRateLimit({
  prefix: 'lookup_ip',
  max: 5,
  windowSec: 15 * 60,
  message: 'Too many status check requests from this IP. Please try again in 15 minutes.'
});

const lookupPhoneLimiter = mongoRateLimit({
  prefix: 'lookup_phone',
  max: 5,
  windowSec: 15 * 60,
  keyGenerator: (req) => req.body?.phone ? String(req.body.phone).replace(/\D/g, '').slice(-10) : null,
  message: 'Too many status check requests for this phone number. Please try again in 15 minutes.'
});

// Rate limiting: Availability: 30 / 15 min per IP
const availabilityLimiter = mongoRateLimit({
  prefix: 'avail_ip',
  max: 30,
  windowSec: 15 * 60,
  message: 'Too many availability requests. Please slow down.'
});

// 1. Public Routes (Specific static endpoints MUST be registered before /:id)
router.get('/availability', availabilityLimiter, getAvailability);
router.post('/lookup', lookupIpLimiter, lookupPhoneLimiter, lookupAppointment);
router.post('/', bookingLimiter, checkHoneypot, createAppointment);

// 2. Private Routes (Admin Protected)
router.get('/activity/logs', protect, getActivityLogs);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
