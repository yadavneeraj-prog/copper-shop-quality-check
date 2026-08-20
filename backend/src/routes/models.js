const express = require('express');
const Model = require('../models/Model');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// edit a model (name and/or FG code)
router.put('/:id', async (req, res) => {
  try {
    const { modelName, fgCode } = req.body;
    const update = {};
    if (modelName) update.modelName = modelName.trim();
    if (fgCode) update.fgCode = fgCode.trim();
    const model = await Model.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!model) return res.status(404).json({ message: 'Model not found.' });
    res.json({ id: model._id, modelName: model.modelName, fgCode: model.fgCode });
  } catch (err) {
    res.status(500).json({ message: 'Could not update model.' });
  }
});

// delete a model
router.delete('/:id', async (req, res) => {
  await Model.findByIdAndDelete(req.params.id);
  res.json({ message: 'Model deleted.' });
});

module.exports = router;
