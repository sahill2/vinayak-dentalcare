const express = require('express');
const router = express.Router();
const { login, logout, changeCredentials } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.put('/change-credentials', protect, changeCredentials);

module.exports = router;
