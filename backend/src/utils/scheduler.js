const cron = require('node-cron');
const CheckSession = require('../models/CheckSession');
const Settings = require('../models/Settings');
const { buildSessionReportExcel } = require('./excelReport');
const { sendMail } = require('./mailer');

// Runs every day at 8:00 PM server time and mails that day's session log
// to every email configured in Settings.reportRecipientEmails.
function startDailyReportJob() {
  cron.schedule('0 20 * * *', async () => {
    try {
      const settings = await Settings.findOne();
      if (!settings || settings.reportRecipientEmails.length === 0) return;

      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);

      const sessions = await CheckSession.find({ startTime: { $gte: start, $lte: end } })
        .populate('user', 'name email')
        .populate({ path: 'partCodeLink', populate: { path: 'model', populate: { path: 'brand' } } })
        .sort({ startTime: 1 });

      if (sessions.length === 0) return;

      const buffer = await buildSessionReportExcel(sessions);
      const fileName = `Copper_Shop_QC_Report_${start.toISOString().slice(0, 10)}.xlsx`;

      await sendMail({
        to: settings.reportRecipientEmails.join(','),
        subject: `Copper Shop Quality Check - Daily Report (${start.toDateString()})`,
        html: `<p>Attached is today's automatic part-code check session report.</p><p style="color:#888;font-size:12px;">Developed by Neeraj Yadav</p>`,
        attachments: [{ filename: fileName, content: buffer }]
      });

      console.log(`Daily report emailed to ${settings.reportRecipientEmails.length} recipient(s).`);
    } catch (err) {
      console.error('Daily report job failed:', err.message);
    }
  });
}

module.exports = { startDailyReportJob };
