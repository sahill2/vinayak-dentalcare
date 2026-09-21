const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Dummy password hash for constant-time comparison when admin not found
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

// Generate JWT token including tokenVersion
const generateToken = (res, adminId, email, tokenVersion = 0) => {
  const token = jwt.sign(
    { id: adminId, email: email, tokenVersion: tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  // Set HTTP-only secure cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000 // 2 hours
  });

  return token;
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public (Rate limited)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Strict type check: both must be non-empty strings
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password format.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      // Execute dummy bcrypt compare to prevent timing-based user enumeration
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check account lockout
    if (admin.isLocked()) {
      const remainingMin = Math.ceil((admin.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMin} minute(s).`
      });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
      
      if (admin.failedLoginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
        admin.failedLoginAttempts = 0;
        await admin.save();
        return res.status(429).json({
          success: false,
          message: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.'
        });
      }

      await admin.save();
      const attemptsLeft = 5 - admin.failedLoginAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. (${attemptsLeft} attempt(s) remaining before temporary lockout)`
      });
    }

    // Reset failed attempts on successful login
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    generateToken(res, admin._id, admin.email, admin.tokenVersion || 0);

    res.status(200).json({
      success: true,
      message: 'Admin authentication successful'
    });
  } catch (error) {
    console.error(`[AUTH LOGIN ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'An internal error occurred during login. Please try again later.' });
  }
};

// @desc    Admin logout
// @route   POST /api/auth/logout
// @access  Private (Admin)
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error(`[AUTH LOGOUT ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to complete logout. Please try again.' });
  }
};

// @desc    Get current admin profile & verify active session
// @route   GET /api/auth/me
// @access  Private (Admin)
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin profile not found' });
    }
    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    console.error(`[AUTH ME ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to verify admin profile.' });
  }
};

// @desc    Update admin credentials
// @route   PUT /api/auth/change-credentials
// @access  Private (Admin)
exports.changeCredentials = async (req, res) => {
  try {
    const { newEmail, currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== 'string' || !currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required to verify changes.' });
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin profile not found.' });
    }

    // Verify current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    // Validate new email format if provided
    if (newEmail) {
      if (typeof newEmail !== 'string' || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(newEmail.trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid new email address.' });
      }
      admin.email = newEmail.trim().toLowerCase();
    }

    // Validate new password length if provided
    if (newPassword) {
      if (typeof newPassword !== 'string' || newPassword.length < 10) {
        return res.status(400).json({ success: false, message: 'New password must be at least 10 characters long.' });
      }
      admin.password = newPassword;
    }

    // Invalidate old tokens by bumping tokenVersion
    admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    await admin.save();

    // Regenerate token and update cookie with bumped tokenVersion
    generateToken(res, admin._id, admin.email, admin.tokenVersion);

    res.status(200).json({
      success: true,
      message: 'Credentials updated successfully. All other active sessions have been invalidated.'
    });
  } catch (error) {
    console.error(`[AUTH CREDENTIALS ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to update credentials. Please try again later.' });
  }
};
