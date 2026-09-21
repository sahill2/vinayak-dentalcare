const { z } = require('zod');
const crypto = require('crypto');
const Inquiry = require('../models/Inquiry');

const normalizePhone = (phoneStr) => {
  if (!phoneStr) return '';
  const digits = String(phoneStr).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
};

// Zod schema for inquiry submission
const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  phone: z.string().trim(),
  email: z.string().trim().max(100, 'Email cannot exceed 100 characters').optional().or(z.literal('')),
  info: z.string().trim().min(1, 'Please enter your message').max(1000, 'Message cannot exceed 1000 characters'),
  source: z.string().trim().max(100).optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'You must provide consent before submitting an inquiry.' })
  })
});

// @desc    Create new contact inquiry
// @route   POST /api/inquiries
// @access  Public (Rate limited)
exports.createInquiry = async (req, res) => {
  try {
    const parseResult = inquirySchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error?.issues?.[0]?.message || parseResult.error?.errors?.[0]?.message || 'Invalid input data.';
      return res.status(400).json({ success: false, message: firstError });
    }

    const { name, phone, email, info, source, consentGiven } = parseResult.data;

    // Validate phone
    const normalizedPhone = normalizePhone(phone);
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number.'
      });
    }

    // Validate email if provided
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
    }

    const id = Date.now() + crypto.randomInt(10, 99);

    const newInquiry = new Inquiry({
      id,
      name: name.trim(),
      phone: normalizedPhone,
      email: email ? email.trim().toLowerCase() : '',
      info: info.trim(),
      source: source || 'Contact Page',
      consentGiven: true,
      consentTimestamp: new Date()
    });

    await newInquiry.save();

    // Do NOT echo the whole record back
    res.status(201).json({
      success: true,
      message: 'Thank you. Your message has been received and our team will contact you shortly.',
      data: {
        id: newInquiry.id,
        name: newInquiry.name,
        date: newInquiry.date
      }
    });
  } catch (error) {
    console.error(`[INQUIRY CREATE ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry. Please try again later.' });
  }
};

// @desc    Get all inquiries (Admin only)
// @route   GET /api/inquiries
// @access  Private (Admin)
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ id: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error(`[INQUIRY GET ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries. Please try again later.' });
  }
};

// @desc    Delete inquiry (Admin only)
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin)
exports.deleteInquiry = async (req, res) => {
  try {
    const numId = Number(req.params.id);
    if (!numId || isNaN(numId)) {
      return res.status(400).json({ success: false, message: 'Invalid inquiry ID.' });
    }

    const inquiry = await Inquiry.findOneAndDelete({ id: numId });

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry record not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error(`[INQUIRY DELETE ERROR] ${error.stack || error.message}`);
    res.status(500).json({ success: false, message: 'Failed to delete inquiry.' });
  }
};
