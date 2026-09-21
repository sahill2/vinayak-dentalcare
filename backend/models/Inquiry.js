const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
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
    default: '',
    trim: true
  },
  info: {
    type: String,
    required: [true, 'Inquiry details are required'],
    trim: true,
    maxlength: 1000
  },
  consentGiven: {
    type: Boolean,
    required: true
  },
  consentTimestamp: {
    type: Date,
    default: null
  },
  date: {
    type: String,
    default: () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  },
  source: {
    type: String,
    default: 'Contact Page'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inquiry', inquirySchema);
