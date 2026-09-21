const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT token
const generateToken = (res, adminId, email) => {
  const token = jwt.sign(
    { id: adminId, email: email },
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
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    generateToken(res, admin._id, admin.email);

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

// @desc    Update admin credentials
// @route   PUT /api/auth/change-credentials
// @access  Private (Admin)
exports.changeCredentials = async (req, res) => {
  try {
    const { newEmail, currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required to verify changes' });
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin profile not found' });
    }

    // Verify current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update fields if provided
    if (newEmail) {
      admin.email = newEmail.toLowerCase();
    }
    if (newPassword) {
      admin.password = newPassword;
    }

    await admin.save();

    // Regenerate token and update cookie with new email
    generateToken(res, admin._id, admin.email);

    res.status(200).json({
      success: true,
      message: 'Credentials updated successfully'
    });
  } catch (error) {
    console.error(`[AUTH CREDENTIALS ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to update credentials. Please try again later.' });
  }
};
