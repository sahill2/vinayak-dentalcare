const express = require('express');
const router = express.Router();
const { login, logout, getMe, changeCredentials } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { mongoRateLimit } = require('../middleware/rateLimiter');

// Rate limiting: 5 per 15 min per IP and per email
const loginIpLimiter = mongoRateLimit({
  prefix: 'login_ip',
  max: 5,
  windowSec: 15 * 60,
  message: 'Too many login attempts from this IP address. Please try again in 15 minutes.'
});

const loginEmailLimiter = mongoRateLimit({
  prefix: 'login_email',
  max: 5,
  windowSec: 15 * 60,
  keyGenerator: (req) => req.body?.email ? String(req.body.email).trim().toLowerCase() : null,
  message: 'Too many login attempts for this email account. Please try again in 15 minutes.'
});

router.post('/login', loginIpLimiter, loginEmailLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/change-credentials', protect, changeCredentials);

module.exports = router;
