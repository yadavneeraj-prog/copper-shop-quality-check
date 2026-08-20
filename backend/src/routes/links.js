const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const PartCodeLink = require('../models/PartCodeLink');
const Model = require('../models/Model');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// keep uploaded file in memory, then push it to Cloudinary (not local disk)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

function uploadBufferToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'copper-shop-qc', public_id: publicId, overwrite: true },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

router.get('/model/:modelId', async (req, res) => {
  const links = await PartCodeLink.find({ model: req.params.modelId }).sort({ createdAt: 1 });
  res.json(links.map(formatLink));
});

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

router.put('/:id', async (req, res) => {
  const { partCode } = req.body;
  const link = await PartCodeLink.findByIdAndUpdate(req.params.id, { partCode: partCode.trim() }, { new: true });
  if (!link) return res.status(404).json({ message: 'Link not found.' });
  res.json(formatLink(link));
});

router.delete('/:id', async (req, res) => {
  const link = await PartCodeLink.findById(req.params.id);
  if (!link) return res.status(404).json({ message: 'Link not found.' });
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

  try {
    const publicId = `${req.params.id}-${slot}`;
    const result = await uploadBufferToCloudinary(req.file.buffer, publicId);

    if (slot === 'suction') link.suctionPhotoUrl = result.secure_url;
    else link.dischargePhotoUrl = result.secure_url;
    await link.save();

    res.json(formatLink(link));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Photo upload failed.' });
  }
});

// delete a photo
router.delete('/:id/photo/:slot', async (req, res) => {
  const { slot } = req.params;
  if (!['suction', 'discharge'].includes(slot)) {
    return res.status(400).json({ message: 'slot must be "suction" or "discharge".' });
  }
  const link = await PartCodeLink.findById(req.params.id);
  if (!link) return res.status(404).json({ message: 'Link not found.' });

  try {
    const publicId = `copper-shop-qc/${req.params.id}-${slot}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete warning:', err.message);
  }

  if (slot === 'suction') link.suctionPhotoUrl = null;
  else link.dischargePhotoUrl = null;
  await link.save();

  res.json(formatLink(link));
});

function formatLink(link) {
  return {
    id: link._id,
    partCode: link.partCode,
    suctionPhotoUrl: link.suctionPhotoUrl,
    dischargePhotoUrl: link.dischargePhotoUrl
  };
}

module.exports = router;
