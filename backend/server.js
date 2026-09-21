const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');

// Load environment variables from backend/.env if available locally
dotenv.config({ path: path.join(__dirname, '.env') });

// Startup environment validation (names only, never values)
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missingEnv = requiredEnv.filter(name => !process.env[name]);

if (missingEnv.length > 0) {
  console.warn(`[STARTUP WARNING] Missing environment variables: ${missingEnv.join(', ')}`);
}

// In production / Vercel, enforce strict security requirements
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  const secret = process.env.JWT_SECRET || '';
  if (!secret || secret.length < 32 || secret.toLowerCase().includes('change') || secret.toLowerCase().includes('secret_key')) {
    throw new Error(`[FATAL] In production, JWT_SECRET must be at least 32 characters and must not contain placeholder phrases.`);
  }
  if (missingEnv.length > 0) {
    throw new Error(`[FATAL] Missing required production environment variables: ${missingEnv.join(', ')}`);
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
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

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

// 0.2 Health Check Endpoint (Registered before other routes, returns only {ok, db} with no error/env details)
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    const isUp = mongoose.connection.readyState === 1;
    return res.status(isUp ? 200 : 503).json({
      ok: isUp,
      db: isUp ? 'up' : 'down'
    });
  } catch (err) {
    console.error(`[HEALTH CHECK ERROR] ${err.message}`);
    return res.status(503).json({
      ok: false,
      db: 'down'
    });
  }
});

// Ensure Database connection is established before processing any other request
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

// Protected page route: Admin Dashboard (Must be verified before serving file from backend/private/)
app.get('/dashboard.html', protect, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'private/dashboard.html'));
});

// Serve frontend static assets from public/ ONLY with dotfiles denied
app.use(express.static(path.join(__dirname, '../public'), { dotfiles: 'deny' }));

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
