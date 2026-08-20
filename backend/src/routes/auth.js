const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail, otpEmailHtml } = require('../utils/mailer');

const router = express.Router();

const MAX_FAILED_ATTEMPTS = 10;

function signToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ---------- SIGN UP ----------
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

    await sendMail({
      to: user.email,
      subject: 'Welcome to Copper Shop Quality Check',
      html: `<p>Hi ${user.name},</p><p>Your account has been created successfully. You can now sign in.</p>`
    });

    return res.status(201).json({ message: 'Account created.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong while creating the account.' });
  }
});

// ---------- LOGIN ----------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
if (!user) return res.status(404).json({ message: 'No account found with this email. Please create an account first.' });

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ message: 'Account locked due to too many failed attempts. Try again later or reset your password.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    const token = signToken(user);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

// ---------- FORGOT PASSWORD: request OTP ----------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    // Always respond the same way so we don't reveal which emails are registered.
    if (!user) return res.json({ message: 'If that email is registered, an OTP has been sent.' });

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendMail({
      to: user.email,
      subject: 'Your Password Reset OTP',
      html: otpEmailHtml(user.name, otp)
    });

    return res.json({ message: 'If that email is registered, an OTP has been sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not process the request.' });
  }
});

// ---------- FORGOT PASSWORD: verify OTP + set new password ----------
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();
    return res.json({ message: 'Password updated. You can sign in now.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not reset password.' });
  }
});

module.exports = router;
