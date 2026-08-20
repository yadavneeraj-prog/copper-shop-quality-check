const express = require('express');
const Brand = require('../models/Brand');
const Model = require('../models/Model');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// list all brands with model counts
router.get('/', async (req, res) => {
  const brands = await Brand.find().sort({ name: 1 });
  const counts = await Model.aggregate([{ $group: { _id: '$brand', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map(c => [String(c._id), c.count]));
  res.json(brands.map(b => ({ id: b._id, name: b.name, modelCount: countMap[String(b._id)] || 0 })));
});

// add a brand
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Brand name is required.' });
    const brand = await Brand.create({ name: name.trim() });
    res.status(201).json({ id: brand._id, name: brand.name });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This brand already exists.' });
    res.status(500).json({ message: 'Could not add brand.' });
  }
});

// rename a brand
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await Brand.findByIdAndUpdate(req.params.id, { name: name.trim() }, { new: true });
    if (!brand) return res.status(404).json({ message: 'Brand not found.' });
    res.json({ id: brand._id, name: brand.name });
  } catch (err) {
    res.status(500).json({ message: 'Could not update brand.' });
  }
});

// delete a brand + its models
router.delete('/:id', async (req, res) => {
  await Model.deleteMany({ brand: req.params.id });
  await Brand.findByIdAndDelete(req.params.id);
  res.json({ message: 'Brand deleted.' });
});

// models under a brand
router.get('/:id/models', async (req, res) => {
  const models = await Model.find({ brand: req.params.id }).sort({ modelName: 1 });
  res.json(models.map(m => ({ id: m._id, modelName: m.modelName, fgCode: m.fgCode })));
});

// add a model under a brand
router.post('/:id/models', async (req, res) => {
  try {
    const { modelName, fgCode } = req.body;
    if (!modelName || !fgCode) return res.status(400).json({ message: 'Model name and FG code are required.' });
    const model = await Model.create({ brand: req.params.id, modelName: modelName.trim(), fgCode: fgCode.trim() });
    res.status(201).json({ id: model._id, modelName: model.modelName, fgCode: model.fgCode });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This model already exists for this brand.' });
    res.status(500).json({ message: 'Could not add model.' });
  }
});

module.exports = router;
