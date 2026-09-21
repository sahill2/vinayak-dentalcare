const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  createAppointment,
  lookupAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getActivityLogs
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { validateAppointmentInput } = require('../middleware/validator');

// Strict rate limiter for public appointment status lookup (10 requests per 15 min per IP)
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many status check requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for appointment creation (20 requests per hour per IP)
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many booking requests from this IP. Please try again later or call the clinic.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes
router.post('/', bookingLimiter, validateAppointmentInput, createAppointment);
router.post('/lookup', lookupLimiter, lookupAppointment);
router.get('/lookup', lookupLimiter, lookupAppointment);

// Private routes (Admin protected)
router.get('/activity/logs', protect, getActivityLogs);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
