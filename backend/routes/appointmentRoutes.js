const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

// Conditional protection middleware: allow public query only if searching by phone
const conditionalProtect = (req, res, next) => {
  if (req.query.phone) {
    return next();
  }
  return protect(req, res, next);
};

router.post('/', createAppointment);
router.get('/', conditionalProtect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
