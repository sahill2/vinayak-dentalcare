const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  referenceCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    minlength: 2,
    maxlength: 60
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  service: {
    type: String,
    default: 'General Dental Checkup',
    trim: true
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending Approval', 'Approved', 'Rejected', 'Rescheduled', 'Completed', 'Cancelled'],
    default: 'Pending Approval'
  },
  consentGiven: {
    type: Boolean,
    default: true
  },
  consentTimestamp: {
    type: Date,
    default: Date.now
  },
  requestDate: {
    type: String,
    default: () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  }
}, {
  timestamps: true
});

// Partial compound index to prevent double-booking on same date and time slot for active appointments
appointmentSchema.index(
  { date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['Cancelled', 'Rejected'] }
    }
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
