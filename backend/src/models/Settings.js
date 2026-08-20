const mongoose = require('mongoose');

// Single-document collection holding the list of emails
// that should automatically receive the daily session report.
const settingsSchema = new mongoose.Schema({
  reportRecipientEmails: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
