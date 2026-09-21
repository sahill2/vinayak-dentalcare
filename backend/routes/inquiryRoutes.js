const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createInquiry, getInquiries, deleteInquiry } = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');
const { validateInquiryInput } = require('../middleware/validator');

const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many inquiries submitted from this IP. Please call or WhatsApp us directly.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/', inquiryLimiter, validateInquiryInput, createInquiry);
router.get('/', protect, getInquiries);
router.delete('/:id', protect, deleteInquiry);

module.exports = router;
