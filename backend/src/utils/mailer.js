const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendMail({ to, subject, html, attachments }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    attachments // [{ filename, content }] - used for the Excel report
  });
}

function otpEmailHtml(name, otp) {
  return `
    <div style="font-family:Segoe UI,sans-serif;max-width:480px;margin:auto;">
      <h2>Password Reset - Copper Shop Quality Check</h2>
      <p>Hi ${name},</p>
      <p>Your one-time password (OTP) to reset your account password is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${otp}</p>
      <p>This OTP is valid for 10 minutes. If you did not request this, you can ignore this email.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">Developed by Neeraj Yadav</p>
    </div>`;
}

module.exports = { sendMail, otpEmailHtml };
