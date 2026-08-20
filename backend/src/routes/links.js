const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PartCodeLink = require('../models/PartCodeLink');
const Model = require('../models/Model');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ---- photo upload setup (stored on disk under /uploads) ----
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}-${req.body.slot}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } }); // 8MB max

// list links for a model
router.get('/model/:modelId', async (req, res) => {
  const links = await PartCodeLink.find({ model: req.params.modelId }).sort({ createdAt: 1 });
  res.json(links.map(formatLink));
});

// create a new link (auto part code + auto "link" identity is just its _id / URL)
router.post('/model/:modelId', async (req, res) => {
  const model = await Model.findById(req.params.modelId);
  if (!model) return res.status(404).json({ message: 'Model not found.' });

  const existingCount = await PartCodeLink.countDocuments({ model: req.params.modelId });
  const partCode = `PART-${String(existingCount + 1).padStart(3, '0')}`;

  const link = await PartCodeLink.create({
    model: req.params.modelId,
    partCode,
    createdBy: req.user.id
  });
  res.status(201).json(formatLink(link));
});

// fetch a single link (this is what opens when the shareable link is clicked)
router.get('/:id', async (req, res) => {
  const link = await PartCodeLink.findById(req.params.id).populate({
    path: 'model',
    populate: { path: 'brand' }
  });
  if (!link) return res.status(404).json({ message: 'Link not found.' });
  res.json({
    id: link._id,
    partCode: link.partCode,
    suctionPhotoUrl: link.suctionPhotoUrl,
    dischargePhotoUrl: link.dischargePhotoUrl,
    model: { id: link.model._id, modelName: link.model.modelName, fgCode: link.model.fgCode },
    brand: { id: link.model.brand._id, name: link.model.brand.name }
  });
});

// rename part code
router.put('/:id', async (req, res) => {
  const { partCode } = req.body;
  const link = await PartCodeLink.findByIdAndUpdate(req.params.id, { partCode: partCode.trim() }, { new: true });
  if (!link) return res.status(404).json({ message: 'Link not found.' });
  res.json(formatLink(link));
});

// delete a link (and its photo files)
router.delete('/:id', async (req, res) => {
  const link = await PartCodeLink.findById(req.params.id);
  if (!link) return res.status(404).json({ message: 'Link not found.' });
  removeFileIfExists(link.suctionPhotoUrl);
  removeFileIfExists(link.dischargePhotoUrl);
  await link.deleteOne();
  res.json({ message: 'Link deleted.' });
});

// upload / replace a photo. body field "slot" = "suction" | "discharge", file field "photo"
router.post('/:id/photo', upload.single('photo'), async (req, res) => {
  const { slot } = req.body;
  if (!['suction', 'discharge'].includes(slot)) {
    return res.status(400).json({ message: 'slot must be "suction" or "discharge".' });
  }
  const link = await PartCodeLink.findById(req.params.id);
  if (!link) return res.status(404).json({ message: 'Link not found.' });

  const oldUrl = slot === 'suction' ? link.suctionPhotoUrl : link.dischargePhotoUrl;
  removeFileIfExists(oldUrl);

  const publicUrl = `/uploads/${req.file.filename}`;
  if (slot === 'suction') link.suctionPhotoUrl = publicUrl; else link.dischargePhotoUrl = publicUrl;
  await link.save();

  res.json(formatLink(link));
});

// delete a photo
router.delete('/:id/photo/:slot', async (req, res) => {
  const { slot } = req.params;
  if (!['suction', 'discharge'].includes(slot)) {
    return res.status(400).json({ message: 'slot must be "suction" or "discharge".' });
  }
  const link = await PartCodeLink.findById(req.params.id);
  if (!link) return res.status(404).json({ message: 'Link not found.' });

  const url = slot === 'suction' ? link.suctionPhotoUrl : link.dischargePhotoUrl;
  removeFileIfExists(url);
  if (slot === 'suction') link.suctionPhotoUrl = null; else link.dischargePhotoUrl = null;
  await link.save();

  res.json(formatLink(link));
});

function removeFileIfExists(publicUrl) {
  if (!publicUrl) return;
  const filePath = path.join(uploadDir, path.basename(publicUrl));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function formatLink(link) {
  return {
    id: link._id,
    partCode: link.partCode,
    suctionPhotoUrl: link.suctionPhotoUrl,
    dischargePhotoUrl: link.dischargePhotoUrl
  };
}

module.exports = router;
