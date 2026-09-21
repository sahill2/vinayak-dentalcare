const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  createAppointment,
  lookupAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

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

// Public routes
router.post('/', createAppointment);
router.post('/lookup', lookupLimiter, lookupAppointment);
router.get('/lookup', lookupLimiter, lookupAppointment);

// Private routes (Admin protected)
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
