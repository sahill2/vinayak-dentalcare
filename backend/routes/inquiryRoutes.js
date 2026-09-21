const express = require('express');
const router = express.Router();
const { createInquiry, getInquiries, deleteInquiry } = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');
const { mongoRateLimit, checkHoneypot } = require('../middleware/rateLimiter');

// Rate limiting: POST /api/inquiries: 5 / hour per IP
const inquiryLimiter = mongoRateLimit({
  prefix: 'inquiry_ip',
  max: 5,
  windowSec: 60 * 60,
  message: 'You have submitted multiple inquiries. Please wait a bit before sending another message or call the clinic.'
});

// Public route with rate limiting and honeypot check
router.post('/', inquiryLimiter, checkHoneypot, createInquiry);

// Private routes (Admin protected)
router.get('/', protect, getInquiries);
router.delete('/:id', protect, deleteInquiry);

module.exports = router;
