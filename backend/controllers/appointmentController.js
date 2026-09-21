const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const ActivityLog = require('../models/ActivityLog');
const { sendStatusEmail } = require('../services/emailService');

// Normalize Indian phone numbers to last 10 digits for consistent comparison
const normalizePhone = (phoneStr) => {
  if (!phoneStr) return '';
  const digits = String(phoneStr).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
};

// Generate a random human-friendly reference code like VDC-4821
const generateReferenceCode = async () => {
  for (let i = 0; i < 10; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const code = `VDC-${num}`;
    const existing = await Appointment.findOne({ referenceCode: code });
    if (!existing) {
      return code;
    }
  }
  // Fallback with timestamp digits
  return `VDC-${Date.now().toString().slice(-4)}`;
};

// @desc    Create new appointment request
// @route   POST /api/appointments
// @access  Public
exports.createAppointment = async (req, res) => {
  try {
    const { patientName, phone, email, service, date, timeSlot, message, consentGiven } = req.body;

    if (!patientName || !phone || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, preferred date, and time slot are required.'
      });
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number.'
      });
    }

    // Check for double booking conflict
    const existingConflict = await Appointment.findOne({
      date,
      timeSlot,
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please select another slot or date.'
      });
    }

    const referenceCode = await generateReferenceCode();

    const newAppointment = new Appointment({
      id: Date.now(),
      referenceCode,
      patientName: patientName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      service: service ? service.trim() : 'General Dental Checkup',
      date,
      timeSlot,
      message: message ? message.trim() : '',
      status: 'Pending Approval',
      consentGiven: consentGiven !== undefined ? Boolean(consentGiven) : true,
      consentTimestamp: new Date()
    });

    await newAppointment.save();

    // Log Activity
    ActivityLog.create({
      action: 'Appointment Requested',
      details: `New booking [${newAppointment.referenceCode}] received from ${newAppointment.patientName} for ${newAppointment.date} at ${newAppointment.timeSlot}.`,
      performedBy: 'Patient'
    }).catch(err => console.warn(`Failed to log activity: ${err.message}`));

    // Trigger optional email notification safely in background without blocking response
    if (newAppointment.email) {
      sendStatusEmail(newAppointment, 'Pending Approval').catch((err) => {
        console.warn(`[EMAIL ERROR] Non-blocking initial booking notification failed: ${err.message}`);
      });
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
    // Handle unique index conflict
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot was just reserved. Please select another slot.'
      });
    }
    res.status(500).json({ success: false, message: 'Failed to create appointment. Please try again later.' });
  }
};

// @desc    Patient privacy lookup by phone AND reference code
// @route   POST /api/appointments/lookup or GET /api/appointments/lookup
// @access  Public (Strictly rate-limited)
exports.lookupAppointment = async (req, res) => {
  try {
    const phone = req.body.phone || req.query.phone;
    const referenceCode = req.body.referenceCode || req.body.code || req.query.referenceCode || req.query.code;

    if (!phone || !referenceCode) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found. Please check your phone number and reference code.'
      });
    }

    const normalizedReqPhone = normalizePhone(phone);
    const cleanCode = String(referenceCode).trim().toUpperCase();

    // Search by exact code first
    const appointment = await Appointment.findOne({ referenceCode: cleanCode });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found. Please check your phone number and reference code.'
      });
    }

    // Verify phone matches
    const appPhoneNormalized = normalizePhone(appointment.phone);
    if (appPhoneNormalized !== normalizedReqPhone && !appointment.phone.includes(phone.trim())) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found. Please check your phone number and reference code.'
      });
    }

    // Privacy protection: Return ONLY status, date, timeSlot, service, referenceCode
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

// @desc    Get all appointments (Admin only, supports filters and pagination)
// @route   GET /api/appointments
// @access  Private (Admin)
exports.getAppointments = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page, limit } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
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
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20; // 20 items per page
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
    const appointment = await Appointment.findOne({ id: req.params.id });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
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

// @desc    Update appointment details / status
// @route   PUT /api/appointments/:id
// @access  Private (Admin)
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ id: req.params.id });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const { status, patientName, date, timeSlot, service, message } = req.body;
    const oldStatus = appointment.status;
    const oldDate = appointment.date;
    const oldTime = appointment.timeSlot;

    let isRescheduled = false;
    if (date && date !== oldDate) isRescheduled = true;
    if (timeSlot && timeSlot !== oldTime) isRescheduled = true;

    // If rescheduling to a new slot, check if destination slot is taken
    if (isRescheduled) {
      const targetDate = date || oldDate;
      const targetTime = timeSlot || oldTime;

      const slotConflict = await Appointment.findOne({
        id: { $ne: appointment.id },
        date: targetDate,
        timeSlot: targetTime,
        status: { $nin: ['Cancelled', 'Rejected'] }
      });

      if (slotConflict) {
        return res.status(409).json({
          success: false,
          message: `The slot on ${targetDate} at ${targetTime} is already booked. Please choose another.`
        });
      }
    }

    if (patientName) appointment.patientName = patientName.trim();
    if (service) appointment.service = service.trim();
    if (date) appointment.date = date;
    if (timeSlot) appointment.timeSlot = timeSlot;
    if (message !== undefined) appointment.message = message.trim();

    if (isRescheduled) {
      appointment.status = 'Rescheduled';
    } else if (status) {
      appointment.status = status;
    }

    await appointment.save();

    // Log admin action to ActivityLog
    const actionDesc = isRescheduled
      ? `Rescheduled appointment [${appointment.referenceCode}] to ${appointment.date} at ${appointment.timeSlot}`
      : `Changed status of [${appointment.referenceCode}] from "${oldStatus}" to "${appointment.status}"`;

    ActivityLog.create({
      action: isRescheduled ? 'Appointment Rescheduled' : 'Status Updated',
      details: actionDesc,
      performedBy: req.admin?.email || 'Admin'
    }).catch(err => console.warn(`Failed to log activity: ${err.message}`));

    // Trigger email alerts safely if status or schedule changed
    if (appointment.email && (appointment.status !== oldStatus || isRescheduled)) {
      sendStatusEmail(appointment, appointment.status).catch((err) => {
        console.warn(`[EMAIL ERROR] Failed to send status update email: ${err.message}`);
      });
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
    const appointment = await Appointment.findOneAndDelete({ id: req.params.id });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Log deletion
    ActivityLog.create({
      action: 'Appointment Deleted',
      details: `Deleted appointment [${appointment.referenceCode}] (#${appointment.id}) for patient ${appointment.patientName}.`,
      performedBy: req.admin?.email || 'Admin'
    }).catch(err => console.warn(`Failed to log activity: ${err.message}`));

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
