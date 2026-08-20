const express = require('express');
const CheckSession = require('../models/CheckSession');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Call this the moment the part-code link opens (start timer).
// Each call creates a NEW row - so opening the same part code 5 times = 5 rows.
router.post('/start', async (req, res) => {
  const { partCodeLinkId } = req.body;
  if (!partCodeLinkId) return res.status(400).json({ message: 'partCodeLinkId is required.' });

  const session = await CheckSession.create({
    partCodeLink: partCodeLinkId,
    user: req.user.id,
    startTime: new Date()
  });
  res.status(201).json({ sessionId: session._id, startTime: session.startTime });
});

// Call this when the user goes back / closes that link (stop timer).
router.post('/:sessionId/end', async (req, res) => {
  const session = await CheckSession.findById(req.params.sessionId);
  if (!session) return res.status(404).json({ message: 'Session not found.' });
  if (session.endTime) return res.json({ message: 'Already ended.', durationSeconds: session.durationSeconds });

  session.endTime = new Date();
  session.durationSeconds = Math.round((session.endTime - session.startTime) / 1000);
  await session.save();

  res.json({
    sessionId: session._id,
    startTime: session.startTime,
    endTime: session.endTime,
    durationSeconds: session.durationSeconds
  });
});

// Optional: list today's sessions for one part-code link (e.g. "opened 5 times today")
router.get('/link/:partCodeLinkId/today', async (req, res) => {
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

  const sessions = await CheckSession.find({
    partCodeLink: req.params.partCodeLinkId,
    startTime: { $gte: startOfDay, $lte: endOfDay }
  }).populate('user', 'name email').sort({ startTime: 1 });

  res.json(sessions.map(s => ({
    sessionId: s._id,
    user: s.user ? { name: s.user.name, email: s.user.email } : null,
    startTime: s.startTime,
    endTime: s.endTime,
    durationSeconds: s.durationSeconds
  })));
});

module.exports = router;
