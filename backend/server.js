const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables from backend/.env if available locally
dotenv.config({ path: path.join(__dirname, '.env') });

// Production safety verification for JWT_SECRET
if (process.env.NODE_ENV === 'production') {
  const secret = process.env.JWT_SECRET;
  const placeholder = 'your_jwt_secret_key_change_this_in_production';
  if (!secret || secret === placeholder || secret.length < 16) {
    console.error('FATAL: A strong, unique JWT_SECRET (minimum 16 characters) is required in production.');
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const { protect } = require('./middleware/auth');

// Initialize Express
const app = express();

// Enable trust proxy for reverse proxies / Vercel serverless / load balancers
app.set('trust proxy', 1);

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Set security headers
app.use(helmet({
  contentSecurityPolicy: false
}));

// Ensure Database connection is established before processing any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(`[DB CONNECTION ERROR] ${err.stack || err.message}`);
    return res.status(503).json({
      success: false,
      message: 'Database service is temporarily unavailable. Please try again shortly.'
    });
  }
});

// General API rate limiting (300 requests per 15 min per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again in 15 minutes.' }
});
app.use('/api', apiLimiter);

// Sanitize data (NoSQL injection prevention)
app.use(mongoSanitize());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Protected page route: Admin Dashboard (Must be verified before serving file)
app.get('/dashboard.html', protect, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dashboard.html'));
});

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '../')));

// Global Error Handler - Logs real error server-side, returns generic message to client
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.status && err.status < 500 ? err.message : 'An internal server error occurred. Please try again later.'
  });
});

const PORT = process.env.PORT || 5000;

// Only start HTTP listener when NOT running in Vercel serverless environment
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app;
