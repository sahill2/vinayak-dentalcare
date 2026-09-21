const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    required: true,
    trim: true
  },
  performedBy: {
    type: String,
    default: 'Admin'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 180 * 24 * 60 * 60 // Auto-deleted after 180 days
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
