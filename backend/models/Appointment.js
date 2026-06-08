const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  message: {
    type: String,
    required: [true, 'Message/Problem description is required'],
    trim: true
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
    enum: ['Pending Approval', 'Approved', 'Rejected', 'Rescheduled'],
    default: 'Pending Approval'
  },
  requestDate: {
    type: String,
    default: () => new Date().toLocaleString()
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
