const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const seedAdmin = require('./utils/seed');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const { protect } = require('./middleware/auth');

// Connect to Database
connectDB();

// Initialize Express
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Set security headers (disable Content Security Policy to allow external CDNs/fonts/images in existing HTML)
app.use(helmet({
  contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again in 15 minutes.' }
});
app.use('/api', limiter);

// Sanitize data (NoSQL injection prevention)
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Seed default admin account
seedAdmin();

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

// Default fallback route for 404s
app.use((req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, '../index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
