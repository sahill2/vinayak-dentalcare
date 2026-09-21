const crypto = require('crypto');
const { z } = require('zod');
const Appointment = require('../models/Appointment');
const ActivityLog = require('../models/ActivityLog');
const { sendStatusEmail } = require('../services/emailService');
const { ALLOWED_SERVICES, ALLOWED_TIME_SLOTS, SLOT_START_TIMES } = require('../config/clinic');

// Unambiguous alphabet (32 chars, no 0, O, 1, I)
const REF_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

// Generate 6-char random alphanumeric reference code like VDC-A7K92M
const generateReferenceCode = async () => {
  for (let attempt = 0; attempt < 15; attempt++) {
    let codeBody = '';
    for (let i = 0; i < 6; i++) {
      const randIndex = crypto.randomInt(0, REF_ALPHABET.length);
      codeBody += REF_ALPHABET[randIndex];
    }
    const code = `VDC-${codeBody}`;
    const existing = await Appointment.findOne({ referenceCode: code });
    if (!existing) {
      return code;
    }
  }
  throw new Error('Failed to generate unique reference code after multiple attempts.');
};

// Generate collision-safe numeric ID
const generateNumericId = async () => {
  for (let i = 0; i < 10; i++) {
    const candidate = Date.now() + crypto.randomInt(100, 999);
    const existing = await Appointment.findOne({ id: candidate });
    if (!existing) {
      return candidate;
    }
  }
  return Date.now();
};

// Normalize Indian phone number to last 10 digits
const normalizePhone = (phoneStr) => {
  if (!phoneStr) return '';
  const digits = String(phoneStr).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
};

// Helper to get current Date in Asia/Kolkata timezone
const getNowKolkata = () => {
  const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(str);
};

// Helper to format Date object to YYYY-MM-DD
const formatDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Validate booking date in Asia/Kolkata
const validateBookingDate = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { valid: false, message: 'Date must be in YYYY-MM-DD format.' };
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);

  // Check valid calendar date
  if (targetDate.getFullYear() !== year || targetDate.getMonth() !== month - 1 || targetDate.getDate() !== day) {
    return { valid: false, message: 'Invalid calendar date.' };
  }

  const nowKolkata = getNowKolkata();
  const todayStr = formatDateStr(nowKolkata);

  // Past date check
  if (dateStr < todayStr) {
    return { valid: false, message: 'Appointment date cannot be in the past.' };
  }

  // Sunday check (0 is Sunday)
  if (targetDate.getDay() === 0) {
    return { valid: false, message: 'Clinic is closed on Sundays. Please select Monday through Saturday.' };
  }

  // Max 60 days ahead
  const maxDate = new Date(nowKolkata.getTime() + 60 * 24 * 60 * 60 * 1000);
  const maxDateStr = formatDateStr(maxDate);
  if (dateStr > maxDateStr) {
    return { valid: false, message: 'Appointments can only be booked up to 60 days in advance.' };
  }

  return { valid: true };
};

// Check if slot has already passed for today
const isSlotInPastForToday = (dateStr, timeSlot) => {
  const nowKolkata = getNowKolkata();
  const todayStr = formatDateStr(nowKolkata);

  if (dateStr !== todayStr) {
    return false;
  }

  const slotInfo = SLOT_START_TIMES[timeSlot];
  if (!slotInfo) {
    return false;
  }

  const currentHour = nowKolkata.getHours();
  const currentMin = nowKolkata.getMinutes();

  if (currentHour > slotInfo.hour || (currentHour === slotInfo.hour && currentMin >= slotInfo.minute)) {
    return true;
  }

  return false;
};

// Escape regex special characters
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Zod Schema for appointment creation
const appointmentCreateSchema = z.object({
  patientName: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  phone: z.string().trim(),
  email: z.string().trim().max(100, 'Email cannot exceed 100 characters').optional().or(z.literal('')),
  service: z.string().trim().refine(val => !val || ALLOWED_SERVICES.includes(val), {
    message: 'Selected service is not offered by the clinic.'
  }).optional(),
  date: z.string().trim(),
  timeSlot: z.string().trim().refine(val => ALLOWED_TIME_SLOTS.includes(val), {
    message: 'Please select a valid operating time slot.'
  }),
  message: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional().or(z.literal('')),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'You must provide consent to book an appointment.' })
  })
});

// @desc    Create new appointment request
// @route   POST /api/appointments
// @access  Public (Rate limited)
exports.createAppointment = async (req, res) => {
  try {
    // 1. Validate request body with Zod
    const validationResult = appointmentCreateSchema.safeParse(req.body);
    if (!validationResult.fail && !validationResult.success) {
      // Fallback
    }
    if (!validationResult.success) {
      const firstError = validationResult.error?.issues?.[0]?.message || validationResult.error?.errors?.[0]?.message || 'Invalid input data.';
      return res.status(400).json({ success: false, message: firstError });
    }

    const { patientName, phone, email, service, date, timeSlot, message, consentGiven } = validationResult.data;

    // 2. Normalize and validate Indian mobile phone
    const normalizedPhone = normalizePhone(phone);
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'
      });
    }

    // 3. Validate Email format if supplied
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
    }

    // 4. Validate Date
    const dateCheck = validateBookingDate(date);
    if (!dateCheck.valid) {
      return res.status(400).json({ success: false, message: dateCheck.message });
    }

    // 5. Check if slot has already passed today
    if (isSlotInPastForToday(date, timeSlot)) {
      return res.status(400).json({
        success: false,
        message: 'This time slot has already passed for today. Please choose a later slot or another day.'
      });
    }

    // 6. Double booking check before save
    const existingConflict = await Appointment.findOne({
      date,
      timeSlot,
      isActive: true
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please select another slot or date.'
      });
    }

    // 7. Generate Reference Code and Collision-Safe Numeric ID
    const referenceCode = await generateReferenceCode();
    const id = await generateNumericId();

    const newAppointment = new Appointment({
      id,
      referenceCode,
      patientName: patientName.trim(),
      phone: normalizedPhone,
      email: email ? email.trim().toLowerCase() : '',
      service: service || 'General Dental Checkup',
      date,
      timeSlot,
      message: message ? message.trim() : '',
      status: 'Pending Approval',
      isActive: true,
      consentGiven: true,
      consentTimestamp: new Date()
    });

    await newAppointment.save();

    // 8. Serverless background work (Awaited with try/catch to avoid loss on function freeze)
    try {
      await Promise.race([
        ActivityLog.create({
          action: 'Appointment Requested',
          details: `New booking [${newAppointment.referenceCode}] received for ${newAppointment.patientName} (${newAppointment.date} at ${newAppointment.timeSlot}).`,
          performedBy: 'Patient'
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('ActivityLog timeout')), 5000))
      ]);
    } catch (logErr) {
      console.warn(`[ACTIVITY LOG ERROR] ${logErr.message}`);
    }

    if (newAppointment.email) {
      try {
        await sendStatusEmail(newAppointment, 'Pending Approval');
      } catch (emailErr) {
        console.warn(`[EMAIL ERROR] ${emailErr.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully.',
      data: {
        id: newAppointment.id,
        referenceCode: newAppointment.referenceCode,
        patientName: newAppointment.patientName,
        date: newAppointment.date,
        timeSlot: newAppointment.timeSlot,
        service: newAppointment.service,
        status: newAppointment.status
      }
    });
  } catch (error) {
    console.error(`[APPOINTMENT CREATE ERROR] ${error.stack || error.message}`);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot was just reserved. Please select another slot.'
      });
    }
    res.status(500).json({ success: false, message: 'Failed to process appointment booking. Please try again later.' });
  }
};

// @desc    Get public availability for a specific date
// @route   GET /api/appointments/availability?date=YYYY-MM-DD
// @access  Public (Rate limited)
exports.getAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, message: 'Date parameter is required in YYYY-MM-DD format.' });
    }

    const dateCheck = validateBookingDate(date);
    if (!dateCheck.valid) {
      return res.status(400).json({ success: false, message: dateCheck.message });
    }

    const activeAppointments = await Appointment.find({
      date: date.trim(),
      isActive: true
    }).select('timeSlot');

    const takenSlots = activeAppointments.map(a => a.timeSlot);

    res.status(200).json({
      success: true,
      data: {
        date: date.trim(),
        takenSlots
      }
    });
  } catch (error) {
    console.error(`[AVAILABILITY ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to retrieve slot availability.' });
  }
};

// @desc    Patient privacy lookup by phone AND reference code (POST only)
// @route   POST /api/appointments/lookup
// @access  Public (Rate limited)
exports.lookupAppointment = async (req, res) => {
  try {
    const { phone, referenceCode, code } = req.body;
    const ref = referenceCode || code;

    if (!phone || !ref || typeof phone !== 'string' || typeof ref !== 'string') {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found. Please check your phone number and reference code.'
      });
    }

    const cleanCode = ref.trim().toUpperCase();
    const cleanPhone = normalizePhone(phone);

    if (cleanPhone.length !== 10) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found. Please check your phone number and reference code.'
      });
    }

    const appointment = await Appointment.findOne({ referenceCode: cleanCode });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found. Please check your phone number and reference code.'
      });
    }

    const storedPhone = normalizePhone(appointment.phone);

    // Constant-time buffer comparison to prevent timing side-channels
    const reqBuf = Buffer.from(cleanPhone, 'utf8');
    const storedBuf = Buffer.from(storedPhone, 'utf8');

    if (reqBuf.length !== storedBuf.length || !crypto.timingSafeEqual(reqBuf, storedBuf)) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found. Please check your phone number and reference code.'
      });
    }

    // Return strictly non-PII fields
    res.status(200).json({
      success: true,
      data: {
        referenceCode: appointment.referenceCode,
        status: appointment.status,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        service: appointment.service || 'General Dental Checkup'
      }
    });
  } catch (error) {
    console.error(`[APPOINTMENT LOOKUP ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'An error occurred while looking up your appointment.' });
  }
};

// @desc    Get all appointments (Admin only)
// @route   GET /api/appointments
// @access  Private (Admin)
exports.getAppointments = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page, limit } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && typeof search === 'string') {
      const sanitizedSearch = escapeRegex(search.trim().slice(0, 50));
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      query.$or = [
        { patientName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { referenceCode: searchRegex },
        { service: searchRegex }
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate && typeof startDate === 'string') query.date.$gte = startDate.trim();
      if (endDate && typeof endDate === 'string') query.date.$lte = endDate.trim();
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort({ date: -1, id: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: appointments
    });
  } catch (error) {
    console.error(`[APPOINTMENT GET ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments. Please try again later.' });
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private (Admin)
exports.getAppointmentById = async (req, res) => {
  try {
    const numId = Number(req.params.id);
    if (!numId || isNaN(numId)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID format.' });
    }

    const appointment = await Appointment.findOne({ id: numId });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(`[APPOINTMENT GET_BY_ID ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch appointment details.' });
  }
};

// @desc    Update appointment details / status / reschedule
// @route   PUT /api/appointments/:id
// @access  Private (Admin)
exports.updateAppointment = async (req, res) => {
  try {
    const numId = Number(req.params.id);
    if (!numId || isNaN(numId)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID format.' });
    }

    const appointment = await Appointment.findOne({ id: numId });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const { status, patientName, date, timeSlot, service, message } = req.body;
    const oldStatus = appointment.status;
    const oldDate = appointment.date;
    const oldTime = appointment.timeSlot;

    let isRescheduled = false;
    if (date && date !== oldDate) isRescheduled = true;
    if (timeSlot && timeSlot !== oldTime) isRescheduled = true;

    // If rescheduling, validate date and slot bounds
    if (isRescheduled) {
      const targetDate = date || oldDate;
      const targetTime = timeSlot || oldTime;

      if (!ALLOWED_TIME_SLOTS.includes(targetTime)) {
        return res.status(400).json({ success: false, message: 'Please select a valid clinic time slot.' });
      }

      const dateCheck = validateBookingDate(targetDate);
      if (!dateCheck.valid) {
        return res.status(400).json({ success: false, message: dateCheck.message });
      }

      const slotConflict = await Appointment.findOne({
        id: { $ne: appointment.id },
        date: targetDate,
        timeSlot: targetTime,
        isActive: true
      });

      if (slotConflict) {
        return res.status(409).json({
          success: false,
          message: `The slot on ${targetDate} at ${targetTime} is already booked. Please choose another.`
        });
      }
    }

    if (patientName && typeof patientName === 'string') appointment.patientName = patientName.trim().slice(0, 60);
    if (service && typeof service === 'string') appointment.service = service.trim();
    if (date) appointment.date = date;
    if (timeSlot) appointment.timeSlot = timeSlot;
    if (message !== undefined) appointment.message = String(message).trim().slice(0, 500);

    const validStatuses = ['Pending Approval', 'Confirmed', 'Approved', 'Rescheduled', 'Completed', 'Cancelled', 'Rejected'];

    if (isRescheduled) {
      appointment.status = 'Rescheduled';
    } else if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid appointment status.' });
      }
      appointment.status = status;
    }

    await appointment.save();

    // Log admin action to ActivityLog
    const actionDesc = isRescheduled
      ? `Rescheduled appointment [${appointment.referenceCode}] to ${appointment.date} at ${appointment.timeSlot}`
      : `Changed status of [${appointment.referenceCode}] from "${oldStatus}" to "${appointment.status}"`;

    try {
      await Promise.race([
        ActivityLog.create({
          action: isRescheduled ? 'Appointment Rescheduled' : 'Status Updated',
          details: actionDesc,
          performedBy: req.admin?.email || 'Admin'
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('ActivityLog timeout')), 5000))
      ]);
    } catch (logErr) {
      console.warn(`[ACTIVITY LOG ERROR] ${logErr.message}`);
    }

    // Trigger email notification safely
    if (appointment.email && (appointment.status !== oldStatus || isRescheduled)) {
      try {
        await sendStatusEmail(appointment, appointment.status);
      } catch (emailErr) {
        console.warn(`[EMAIL ERROR] ${emailErr.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error(`[APPOINTMENT UPDATE ERROR] ${error.stack || error.message}`);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already taken. Please choose another.'
      });
    }
    res.status(500).json({ success: false, message: 'Failed to update appointment. Please try again.' });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin)
exports.deleteAppointment = async (req, res) => {
  try {
    const numId = Number(req.params.id);
    if (!numId || isNaN(numId)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID format.' });
    }

    const appointment = await Appointment.findOneAndDelete({ id: numId });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    try {
      await ActivityLog.create({
        action: 'Appointment Deleted',
        details: `Deleted appointment [${appointment.referenceCode}] (#${appointment.id}) for patient ${appointment.patientName}.`,
        performedBy: req.admin?.email || 'Admin'
      });
    } catch (logErr) {
      console.warn(`[ACTIVITY LOG ERROR] ${logErr.message}`);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error(`[APPOINTMENT DELETE ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to delete appointment.' });
  }
};

// @desc    Get activity logs
// @route   GET /api/appointments/activity/logs
// @access  Private (Admin)
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error(`[APPOINTMENT LOGS ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch activity logs.' });
  }
};
