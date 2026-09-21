const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
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
    default: '',
    maxlength: 500
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    index: true
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending Approval', 'Confirmed', 'Approved', 'Rescheduled', 'Completed', 'Cancelled', 'Rejected'],
    default: 'Pending Approval',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  consentGiven: {
    type: Boolean,
    required: true
  },
  consentTimestamp: {
    type: Date,
    default: null
  },
  requestDate: {
    type: String,
    default: () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  }
}, {
  timestamps: true
});

// Synchronize isActive before saving
appointmentSchema.pre('save', function (next) {
  const activeStatuses = ['Pending Approval', 'Confirmed', 'Approved', 'Rescheduled'];
  this.isActive = activeStatuses.includes(this.status);
  next();
});

// Partial compound unique index: Prevents double-booking where isActive is true
appointmentSchema.index(
  { date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
