const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, logout, changeCredentials } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Strict brute-force protection for login endpoint (5 attempts per 15 min per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many failed login attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.put('/change-credentials', protect, changeCredentials);

module.exports = router;
