const express = require('express');
const CheckSession = require('../models/CheckSession');
const Settings = require('../models/Settings');
const { requireAuth } = require('../middleware/auth');
const { buildSessionReportExcel } = require('../utils/excelReport');
const { sendMail } = require('../utils/mailer');

const router = express.Router();
router.use(requireAuth);

// ---- manage the list of emails that receive the auto report ----
router.get('/recipients', async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ emails: settings.reportRecipientEmails });
});

router.post('/recipients', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  const settings = await getOrCreateSettings();
  if (!settings.reportRecipientEmails.includes(email)) {
    settings.reportRecipientEmails.push(email);
    await settings.save();
  }
  res.json({ emails: settings.reportRecipientEmails });
});

router.delete('/recipients/:email', async (req, res) => {
  const settings = await getOrCreateSettings();
  settings.reportRecipientEmails = settings.reportRecipientEmails.filter(e => e !== req.params.email);
  await settings.save();
  res.json({ emails: settings.reportRecipientEmails });
});

// ---- generate + send the report for a given date range (defaults to today) ----
router.post('/send', async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const from = fromDate ? new Date(fromDate) : startOfToday();
    const to = toDate ? new Date(toDate) : endOfToday();

    const sessions = await CheckSession.find({ startTime: { $gte: from, $lte: to } })
      .populate('user', 'name email')
      .populate({
        path: 'partCodeLink',
        populate: { path: 'model', populate: { path: 'brand' } }
      })
      .sort({ startTime: 1 });

    const settings = await getOrCreateSettings();
    if (settings.reportRecipientEmails.length === 0) {
      return res.status(400).json({ message: 'No report recipient emails configured yet.' });
    }

    const buffer = await buildSessionReportExcel(sessions);
    const fileName = `Copper_Shop_QC_Report_${from.toISOString().slice(0, 10)}.xlsx`;

    await sendMail({
      to: settings.reportRecipientEmails.join(','),
      subject: `Copper Shop Quality Check - Session Report (${from.toDateString()})`,
      html: `<p>Please find attached the part-code check session report.</p><p style="color:#888;font-size:12px;">Developed by Neeraj Yadav</p>`,
      attachments: [{ filename: fileName, content: buffer }]
    });

    res.json({ message: `Report sent to ${settings.reportRecipientEmails.length} recipient(s).`, rows: sessions.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not send report.' });
  }
});

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({ reportRecipientEmails: [] });
  return settings;
}
function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function endOfToday() { const d = new Date(); d.setHours(23, 59, 59, 999); return d; }

module.exports = router;
