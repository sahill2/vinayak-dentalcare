const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
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
      return res.redirect('/admin/index.html');
    }
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    if (isApiRequest) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    } else {
      // Clear cookie if invalid to avoid infinite loops
      res.clearCookie('token');
      return res.redirect('/admin/index.html');
    }
  }
};

module.exports = { protect };
