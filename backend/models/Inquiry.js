const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    default: 'N/A',
    trim: true
  },
  info: {
    type: String,
    required: [true, 'Inquiry details are required'],
    trim: true
  },
  date: {
    type: String,
    default: () => new Date().toLocaleString()
  },
  source: {
    type: String,
    default: 'Contact Page'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inquiry', inquirySchema);
