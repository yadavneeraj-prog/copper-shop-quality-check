const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  modelName: { type: String, required: true, trim: true },
  fgCode: { type: String, required: true, trim: true }
}, { timestamps: true });

// same model name should not repeat twice under the same brand
modelSchema.index({ brand: 1, modelName: 1 }, { unique: true });

module.exports = mongoose.model('Model', modelSchema);
