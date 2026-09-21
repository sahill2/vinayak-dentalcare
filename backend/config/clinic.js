/**
 * Backend single source of truth for clinic services and scheduling constraints.
 * Mirrors public/js/config.js.
 */

const ALLOWED_SERVICES = [
  "General Dental Checkup",
  "Teeth Cleaning & Scaling",
  "Root Canal Treatment (RCT)",
  "Dental Implants",
  "Teeth Whitening",
  "Braces & Clear Aligners",
  "Pediatric (Kids) Dentistry",
  "Crowns & Dental Bridges"
];

const ALLOWED_TIME_SLOTS = [
  "09:30 AM - 10:30 AM",
  "10:30 AM - 11:30 AM",
  "11:30 AM - 12:30 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM"
];

// Mapping of slot starting times in 24h format (Asia/Kolkata)
const SLOT_START_TIMES = {
  "09:30 AM - 10:30 AM": { hour: 9, minute: 30 },
  "10:30 AM - 11:30 AM": { hour: 10, minute: 30 },
  "11:30 AM - 12:30 PM": { hour: 11, minute: 30 },
  "04:00 PM - 05:00 PM": { hour: 16, minute: 0 },
  "05:00 PM - 06:00 PM": { hour: 17, minute: 0 },
  "06:00 PM - 07:00 PM": { hour: 18, minute: 0 },
  "07:00 PM - 08:00 PM": { hour: 19, minute: 0 }
};

module.exports = {
  ALLOWED_SERVICES,
  ALLOWED_TIME_SLOTS,
  SLOT_START_TIMES
};
