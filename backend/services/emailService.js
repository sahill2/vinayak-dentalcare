const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Return null if SMTP_USER is placeholder or missing
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'admin@vinayakdentalcare.com' || process.env.SMTP_PASS === 'your_email_app_password') {
    console.warn('SMTP credentials are not configured in .env. Email notifications will be logged to console instead.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendStatusEmail = async (appointment, newStatus) => {
  const { patientName, email, date, timeSlot } = appointment;
  const transporter = createTransporter();

  let subject = '';
  let htmlContent = '';

  const brandColor = '#20B2AA'; // Primary teal/green from website styling
  const footerBg = '#0F1728';

  if (newStatus === 'Approved') {
    subject = 'Appointment Confirmed - Vinayak Dental Care';
    htmlContent = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0F172A, #1E293B); padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0; font-family: 'Poppins', sans-serif; font-size: 24px;">Vinayak Dental Care</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">Your Smile is Our Priority</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #334155;">
          <h3 style="color: ${brandColor}; margin-top: 0; font-size: 20px;">Appointment Confirmed!</h3>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>We are pleased to inform you that your appointment request has been approved and confirmed. Please find the details below:</p>
          
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; font-weight: 500; color: #64748B; width: 120px;">Date:</td>
                <td style="padding: 5px 0; font-weight: 600; color: #0F172A;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: 500; color: #64748B;">Time Slot:</td>
                <td style="padding: 5px 0; font-weight: 600; color: #0F172A;">${timeSlot}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: 500; color: #64748B;">Status:</td>
                <td style="padding: 5px 0;"><span style="background-color: #D1FAE5; color: #059669; padding: 4px 10px; border-radius: 50px; font-size: 12px; font-weight: 600;">CONFIRMED</span></td>
              </tr>
            </table>
          </div>
          
          <p style="margin-bottom: 5px;"><strong>Location:</strong> B-10 Laxmipooja Complex, Near Bandhan Hotel, Kapadvanj, Gujarat 387620</p>
          <p style="margin-top: 0; font-size: 14px; color: #64748B;">Please try to arrive 10 minutes prior to your scheduled time slot.</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 20px;">Best Regards,<br><strong>Dr. Vishal & Dr. Devanshi</strong><br>Vinayak Dental Care Team</p>
        </div>
        <div style="background-color: ${footerBg}; color: #94A3B8; text-align: center; padding: 15px; font-size: 12px;">
          <p style="margin: 0;">&copy; 2026 Vinayak Dental Care. All Rights Reserved.</p>
        </div>
      </div>
    `;
  } else if (newStatus === 'Rejected') {
    subject = 'Appointment Request Update - Vinayak Dental Care';
    htmlContent = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0F172A, #1E293B); padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0; font-family: 'Poppins', sans-serif; font-size: 24px;">Vinayak Dental Care</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">Your Smile is Our Priority</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #334155;">
          <h3 style="color: #DC2626; margin-top: 0; font-size: 20px;">Appointment Request Declined</h3>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>We appreciate your interest in booking an appointment with Vinayak Dental Care. Unfortunately, we are unable to approve your appointment request for <strong>${date} at ${timeSlot}</strong> due to schedule conflicts or unavailability.</p>
          
          <div style="background-color: #FFF5F5; border: 1px solid #FED7D7; border-radius: 6px; padding: 15px; margin: 20px 0; color: #C53030;">
             Your appointment request was rejected. We apologize for the inconvenience caused.
          </div>
          
          <p>Please feel free to visit our website and request another date or time slot that works for you, or contact our clinic directly at +91 XXXXX XXXXX to find an alternative opening.</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 20px;">Best Regards,<br><strong>Dr. Vishal & Dr. Devanshi</strong><br>Vinayak Dental Care Team</p>
        </div>
        <div style="background-color: ${footerBg}; color: #94A3B8; text-align: center; padding: 15px; font-size: 12px;">
          <p style="margin: 0;">&copy; 2026 Vinayak Dental Care. All Rights Reserved.</p>
        </div>
      </div>
    `;
  } else if (newStatus === 'Rescheduled') {
    subject = 'Appointment Rescheduled - Vinayak Dental Care';
    htmlContent = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0F172A, #1E293B); padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0; font-family: 'Poppins', sans-serif; font-size: 24px;">Vinayak Dental Care</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px;">Your Smile is Our Priority</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #334155;">
          <h3 style="color: #2563EB; margin-top: 0; font-size: 20px;">Appointment Rescheduled</h3>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Please note that your appointment has been moved to a new date/time. The updated details are below:</p>
          
          <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; font-weight: 500; color: #4B5563; width: 120px;">New Date:</td>
                <td style="padding: 5px 0; font-weight: 600; color: #1E3A8A;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: 500; color: #4B5563;">New Time Slot:</td>
                <td style="padding: 5px 0; font-weight: 600; color: #1E3A8A;">${timeSlot}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: 500; color: #4B5563;">Status:</td>
                <td style="padding: 5px 0;"><span style="background-color: #DBEAFE; color: #1D4ED8; padding: 4px 10px; border-radius: 50px; font-size: 12px; font-weight: 600;">RESCHEDULED</span></td>
              </tr>
            </table>
          </div>
          
          <p>If this new slot does not work for you, please let us know immediately by calling our reception desk.</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 20px;">Best Regards,<br><strong>Dr. Vishal & Dr. Devanshi</strong><br>Vinayak Dental Care Team</p>
        </div>
        <div style="background-color: ${footerBg}; color: #94A3B8; text-align: center; padding: 15px; font-size: 12px;">
          <p style="margin: 0;">&copy; 2026 Vinayak Dental Care. All Rights Reserved.</p>
        </div>
      </div>
    `;
  }

  if (!transporter) {
    console.log(`[SIMULATED EMAIL] To: ${email} | Subject: ${subject} | Content: ${newStatus} email sent.`);
    return true;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Vinayak Dental Care" <admin@vinayakdentalcare.com>',
      to: email,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email} for status: ${newStatus}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error.message}`);
    // Return true anyway so database operation or client response doesn't fail
    return false;
  }
};

module.exports = { sendStatusEmail };
