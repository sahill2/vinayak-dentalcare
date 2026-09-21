const nodemailer = require('nodemailer');

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const createTransporter = () => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'admin@vinayakdentalcare.com' || process.env.SMTP_PASS === 'your_email_app_password') {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendStatusEmail = async (appointment, newStatus) => {
  const safeName = escapeHtml(appointment.patientName);
  const safeDate = escapeHtml(appointment.date);
  const safeTime = escapeHtml(appointment.timeSlot);
  const safeCode = escapeHtml(appointment.referenceCode);
  const email = appointment.email;

  if (!email || !email.includes('@')) {
    return true;
  }

  const transporter = createTransporter();
  let subject = '';
  let statusBadge = '';

  const brandColor = '#0F5E5B'; // Warm clinic teal
  const accentColor = '#B4532A';

  if (newStatus === 'Confirmed' || newStatus === 'Approved') {
    subject = `Appointment Confirmed [${safeCode}] - Vinayak Dental Care`;
    statusBadge = `<span style="background-color: #D1FAE5; color: #059669; padding: 4px 12px; border-radius: 50px; font-size: 13px; font-weight: 600;">CONFIRMED</span>`;
  } else if (newStatus === 'Rescheduled') {
    subject = `Appointment Rescheduled [${safeCode}] - Vinayak Dental Care`;
    statusBadge = `<span style="background-color: #DBEAFE; color: #1D4ED8; padding: 4px 12px; border-radius: 50px; font-size: 13px; font-weight: 600;">RESCHEDULED</span>`;
  } else if (newStatus === 'Cancelled' || newStatus === 'Rejected') {
    subject = `Appointment Update [${safeCode}] - Vinayak Dental Care`;
    statusBadge = `<span style="background-color: #FEE2E2; color: #DC2626; padding: 4px 12px; border-radius: 50px; font-size: 13px; font-weight: 600;">CANCELLED</span>`;
  } else {
    subject = `Appointment Request Received [${safeCode}] - Vinayak Dental Care`;
    statusBadge = `<span style="background-color: #FEF3C7; color: #D97706; padding: 4px 12px; border-radius: 50px; font-size: 13px; font-weight: 600;">PENDING APPROVAL</span>`;
  }

  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #12302F; padding: 30px; text-align: center; color: #FBF7EF;">
        <h2 style="margin: 0; font-family: Georgia, serif; font-size: 24px;">Vinayak Dental Care</h2>
        <p style="margin: 6px 0 0 0; opacity: 0.8; font-size: 14px;">Kapadvanj, Gujarat</p>
      </div>
      <div style="padding: 30px; background-color: #FFFDF9; color: #3A4547;">
        <h3 style="color: ${brandColor}; margin-top: 0; font-size: 20px;">Appointment Update</h3>
        <p>Dear <strong>${safeName}</strong>,</p>
        <p>Your appointment status at Vinayak Dental Care has been updated:</p>
        
        <div style="background-color: #FBF7EF; border: 1px solid #DDD2BF; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #5A6669; width: 140px;">Reference Code:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #1E2A2B;">${safeCode}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #5A6669;">Date:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1E2A2B;">${safeDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #5A6669;">Time Slot:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1E2A2B;">${safeTime}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #5A6669;">Status:</td>
              <td style="padding: 6px 0;">${statusBadge}</td>
            </tr>
          </table>
        </div>
        
        <p style="margin-bottom: 5px; font-size: 14px;"><strong>Clinic Address:</strong> B-10 Laxmipooja Complex, Near Bandhan Hotel, Kapadvanj, Gujarat 387620</p>
        <p style="margin-top: 0; font-size: 13px; color: #5A6669;">Please arrive 10 minutes prior to your scheduled time.</p>
        
        <p style="margin-top: 30px; border-top: 1px solid #DDD2BF; padding-top: 20px; font-size: 14px;">Best Regards,<br><strong>Dr. Vishal & Dr. Devanshi</strong><br>Vinayak Dental Care Team</p>
      </div>
      <div style="background-color: #12302F; color: #B8C8C6; text-align: center; padding: 15px; font-size: 12px;">
        <p style="margin: 0;">&copy; 2026 Vinayak Dental Care. All Rights Reserved.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log(`[SIMULATED EMAIL] To: ${email} | Subject: ${subject}`);
    return true;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Vinayak Dental Care" <admin@vinayakdentalcare.com>',
      to: email,
      subject: subject,
      html: htmlContent
    };

    // 5-second timeout race
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP sendMail timeout (5s)')), 5000))
    ]);

    console.log(`[EMAIL SENT] Notification delivered to ${email} for status: ${newStatus}`);
    return true;
  } catch (error) {
    console.warn(`[EMAIL WARNING] Failed to deliver email to ${email}: ${error.message}`);
    return false;
  }
};

module.exports = { sendStatusEmail };
