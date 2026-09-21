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
    process.exit(1);
  }
}

const connectDB = require('./config/db');
const seedAdmin = require('./utils/seed');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const { protect } = require('./middleware/auth');

// Connect to Database
connectDB().then(() => {
  // Seed admin account if configured in env
  seedAdmin();
}).catch((err) => {
  console.error(`Initial database connection error: ${err.message}`);
});

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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Only start the standalone HTTP listener when executed directly (not in Vercel serverless)
if (process.env.VERCEL !== '1' && require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app;
