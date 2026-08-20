const mongoose = require('mongoose');

// One row per "open -> back/close" cycle on a part code link.
// If the same part code is opened 5 times in a day, that is 5 rows.
const checkSessionSchema = new mongoose.Schema({
  partCodeLink: { type: mongoose.Schema.Types.ObjectId, ref: 'PartCodeLink', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, default: null },
  durationSeconds: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('CheckSession', checkSessionSchema);
