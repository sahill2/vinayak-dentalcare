const Appointment = require('../models/Appointment');
const { sendStatusEmail } = require('../services/emailService');

// @desc    Create new appointment request
// @route   POST /api/appointments
// @access  Public
exports.createAppointment = async (req, res) => {
  try {
    const { patientName, phone, email, date, timeSlot, message } = req.body;

    if (!patientName || !phone || !email || !date || !timeSlot || !message) {
      return res.status(400).json({ success: false, message: 'All booking fields are required' });
    }

    const newAppointment = new Appointment({
      id: Date.now(), // Numeric ID compatible with frontend
      patientName,
      phone,
      email,
      date,
      timeSlot,
      message,
      status: 'Pending Approval'
    });

    await newAppointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully',
      data: newAppointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

// @desc    Get appointments (Admin gets all, Patient filters by phone)
// @route   GET /api/appointments
// @access  Public (if searching by phone) / Private (if loading all)
exports.getAppointments = async (req, res) => {
  try {
    const { phone } = req.query;

    if (phone) {
      // Public query by phone number
      const appointments = await Appointment.find({ phone: phone.trim() })
        .select('id patientName phone email date timeSlot status requestDate')
        .sort({ id: -1 });

      return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    }

    // Admin query (requires token, which is handled by protect middleware in route)
    const appointments = await Appointment.find({}).sort({ id: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
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
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
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

    const { status, patientName, date, timeSlot, message } = req.body;
    const oldStatus = appointment.status;
    const oldDate = appointment.date;
    const oldTime = appointment.timeSlot;

    // Check if reschedule occurred
    let isRescheduled = false;
    if (date && date !== oldDate) isRescheduled = true;
    if (timeSlot && timeSlot !== oldTime) isRescheduled = true;

    // Apply updates
    if (patientName) appointment.patientName = patientName;
    if (date) appointment.date = date;
    if (timeSlot) appointment.timeSlot = timeSlot;
    if (message) appointment.message = message;

    if (isRescheduled) {
      appointment.status = 'Rescheduled';
    } else if (status) {
      appointment.status = status;
    }

    await appointment.save();

    // Trigger email alerts if status changed
    if (appointment.status !== oldStatus) {
      // Send email notifications
      await sendStatusEmail(appointment, appointment.status);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
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

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};
