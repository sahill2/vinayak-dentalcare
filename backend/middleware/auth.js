const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  // Retrieve token from cookie or authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  const isApiRequest = req.originalUrl.startsWith('/api');

  if (!token) {
    if (isApiRequest) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    } else {
      return res.redirect(302, '/admin/index.html');
    }
  }

  try {
    // Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin exists and tokenVersion matches
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      if (isApiRequest) {
        return res.status(401).json({ success: false, message: 'Not authorized, account no longer exists' });
      } else {
        res.clearCookie('token');
        return res.redirect(302, '/admin/index.html');
      }
    }

    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== (admin.tokenVersion || 0)) {
      if (isApiRequest) {
        return res.status(401).json({ success: false, message: 'Session expired due to password change. Please log in again.' });
      } else {
        res.clearCookie('token');
        return res.redirect(302, '/admin/index.html');
      }
    }

    req.admin = {
      id: admin._id,
      email: admin.email,
      tokenVersion: admin.tokenVersion
    };
    next();
  } catch (error) {
    if (isApiRequest) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    } else {
      res.clearCookie('token');
      return res.redirect(302, '/admin/index.html');
    }
  }
};

module.exports = { protect };
