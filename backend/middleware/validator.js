/**
 * Request Validation & Sanitization Middleware
 */

const ALLOWED_SERVICES = [
  'General Dental Checkup',
  'Teeth Cleaning & Scaling',
  'Root Canal Treatment (RCT)',
  'Dental Implants',
  'Teeth Whitening',
  'Braces & Clear Aligners',
  'Pediatric (Kids) Dentistry',
  'Crowns & Dental Bridges',
  'Tooth Extraction / Other',
  'General Consultation',
  'Smile Designing',
  'Other Inquiry'
];

// Helper to escape HTML characters in strings to prevent injection/XSS
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Validate Indian mobile phone: 10 digits starting with 6-9 (optional +91 or 0 prefix)
const validateIndianPhone = (phoneStr) => {
  if (!phoneStr) return false;
  const cleaned = String(phoneStr).replace(/[\s\-\(\)]/g, '');
  // Allows +919876543210, 919876543210, 09876543210, or 9876543210
  const indianPhoneRegex = /^(?:\+?91|0)?[6-9]\d{9}$/;
  return indianPhoneRegex.test(cleaned);
};

// Validate date is valid YYYY-MM-DD, not in past, and not Sunday
const validateAppointmentDate = (dateStr) => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { valid: false, message: 'Please provide a valid date format (YYYY-MM-DD).' };
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);

  // Check invalid date (e.g. Feb 31)
  if (targetDate.getFullYear() !== year || targetDate.getMonth() !== month - 1 || targetDate.getDate() !== day) {
    return { valid: false, message: 'Invalid calendar date.' };
  }

  // Check not Sunday
  if (targetDate.getDay() === 0) {
    return { valid: false, message: 'The clinic is closed on Sundays. Please choose a Monday through Saturday slot.' };
  }

  // Check not in the past
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (targetDate < todayMidnight) {
    return { valid: false, message: 'Appointment date cannot be in the past.' };
  }

  return { valid: true };
};

// Validate time slot is within 9:00 AM - 8:00 PM
const validateTimeSlot = (slotStr) => {
  if (!slotStr) return false;
  const timeRegex = /^(0?[9]|1[0-2]|0?[1-8]):([0-5]\d)\s*(AM|PM)$/i;
  const match = String(slotStr).trim().match(timeRegex);
  if (!match) return false;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3].toUpperCase();

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  // Clinic is open 9:00 (9:00 AM) to 20:00 (8:00 PM)
  const totalMinutes = hours * 60 + minutes;
  const openMinutes = 9 * 60; // 9:00 AM
  const closeMinutes = 20 * 60; // 8:00 PM

  return totalMinutes >= openMinutes && totalMinutes <= closeMinutes;
};

// Validate email format
const validateEmail = (emailStr) => {
  if (!emailStr) return true; // optional
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(String(emailStr).trim());
};

// Middleware: Validate Appointment Creation Request
const validateAppointmentInput = (req, res, next) => {
  const { patientName, phone, email, date, timeSlot, service, message, consentGiven } = req.body;
  const errors = {};

  // Name validation
  if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2 || patientName.trim().length > 60) {
    errors.patientName = 'Patient name must be between 2 and 60 characters.';
  }

  // Phone validation
  if (!phone || !validateIndianPhone(phone)) {
    errors.phone = 'Please provide a valid 10-digit Indian mobile number (e.g. 9876543210).';
  }

  // Email validation (optional)
  if (email && !validateEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  // Date validation
  const dateCheck = validateAppointmentDate(date);
  if (!dateCheck.valid) {
    errors.date = dateCheck.message;
  }

  // Time slot validation
  if (!timeSlot || !validateTimeSlot(timeSlot)) {
    errors.timeSlot = 'Time slot must be within clinic hours (9:00 AM to 8:00 PM).';
  }

  // Service validation
  if (service && !ALLOWED_SERVICES.some(s => s.toLowerCase() === String(service).trim().toLowerCase())) {
    // Allow custom but sanitize
    req.body.service = escapeHtml(String(service).trim().slice(0, 80));
  }

  // Consent validation
  if (consentGiven === false || consentGiven === 'false') {
    errors.consentGiven = 'You must agree to the privacy policy and consent to be contacted.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: Object.values(errors)[0], // Primary message
      errors
    });
  }

  // Sanitize text inputs
  if (req.body.patientName) req.body.patientName = escapeHtml(req.body.patientName.trim());
  if (req.body.message) req.body.message = escapeHtml(req.body.message.trim().slice(0, 1000));

  next();
};

// Middleware: Validate Inquiry Creation Request
const validateInquiryInput = (req, res, next) => {
  const { name, phone, email, info } = req.body;
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
    errors.name = 'Name must be between 2 and 60 characters.';
  }

  if (!phone || !validateIndianPhone(phone)) {
    errors.phone = 'Please provide a valid 10-digit Indian mobile number.';
  }

  if (email && !validateEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!info || typeof info !== 'string' || info.trim().length < 2) {
    errors.info = 'Please provide your message or inquiry details.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: Object.values(errors)[0],
      errors
    });
  }

  // Sanitize text inputs
  if (req.body.name) req.body.name = escapeHtml(req.body.name.trim());
  if (req.body.info) req.body.info = escapeHtml(req.body.info.trim().slice(0, 1000));
  if (req.body.source) req.body.source = escapeHtml(String(req.body.source).trim().slice(0, 100));

  next();
};

module.exports = {
  escapeHtml,
  validateAppointmentInput,
  validateInquiryInput,
  ALLOWED_SERVICES
};
