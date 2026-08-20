// Sends email via Brevo's HTTPS API (works reliably even on hosts
// that block outbound SMTP ports, unlike Nodemailer + SMTP).

async function sendMail({ to, subject, html, attachments }) {
  const toList = String(to).split(',').map(e => ({ email: e.trim() }));

  const payload = {
    sender: { name: 'Copper Shop Quality Check', email: process.env.SMTP_USER },
    to: toList,
    subject,
    htmlContent: html
  };

  if (attachments && attachments.length) {
    payload.attachment = attachments.map(a => ({
      content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : a.content,
      name: a.filename
    }));
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error('Email send failed: ' + errText);
  }
  return res.json();
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
