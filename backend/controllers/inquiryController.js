const Inquiry = require('../models/Inquiry');

// @desc    Create new contact inquiry
// @route   POST /api/inquiries
// @access  Public
exports.createInquiry = async (req, res) => {
  try {
    const { name, phone, email, info, source } = req.body;

    if (!name || !phone || !info) {
      return res.status(400).json({ success: false, message: 'Name, phone and inquiry details are required' });
    }

    const newInquiry = new Inquiry({
      id: Date.now(), // Numeric ID compatible with frontend
      name,
      phone,
      email: email || 'N/A',
      info,
      source: source || 'Contact Page'
    });

    await newInquiry.save();

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: newInquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

// @desc    Get all inquiries
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
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin)
exports.deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOneAndDelete({ id: req.params.id });

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};
