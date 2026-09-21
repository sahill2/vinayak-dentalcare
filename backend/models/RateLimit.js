const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    index: true
  },
  count: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Mongo TTL: documents auto-deleted after 1 hour maximum
  }
});

module.exports = mongoose.model('RateLimit', rateLimitSchema);
