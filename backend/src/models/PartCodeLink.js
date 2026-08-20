const mongoose = require('mongoose');

// Each of these = one dynamically generated, shareable link.
// A single Model can have many PartCodeLinks (one per part code).
const partCodeLinkSchema = new mongoose.Schema({
  model: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
  partCode: { type: String, required: true, trim: true },
  suctionPhotoUrl: { type: String, default: null },
  dischargePhotoUrl: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PartCodeLink', partCodeLinkSchema);
