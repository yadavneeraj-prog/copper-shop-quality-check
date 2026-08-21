const ExcelJS = require('exceljs');

// Builds the daily/ranged session-time Excel report.
// One row per check session (one open->close cycle on a part code link).
async function buildSessionReportExcel(sessions) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Copper Shop Quality Check';
  const sheet = workbook.addWorksheet('Session Log');

  sheet.columns = [
    { header: 'S.No', key: 'sno', width: 6 },
    { header: 'User Name', key: 'userName', width: 20 },
    { header: 'User Email', key: 'userEmail', width: 26 },
    { header: 'Brand', key: 'brand', width: 18 },
    { header: 'Model', key: 'model', width: 20 },
    { header: 'FG Code', key: 'fgCode', width: 20 },
    { header: 'Part Code', key: 'partCode', width: 20 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Start Time', key: 'startTime', width: 14 },
    { header: 'End Time', key: 'endTime', width: 14 },
    { header: 'Duration (mm:ss)', key: 'duration', width: 16 }
  ];
  sheet.getRow(1).font = { bold: true };

  sessions.forEach((s, i) => {
    const durationSec = s.durationSeconds || 0;
    const mm = String(Math.floor(durationSec / 60)).padStart(2, '0');
    const ss = String(Math.floor(durationSec % 60)).padStart(2, '0');

    sheet.addRow({
      sno: i + 1,
      userName: s.user?.name || '',
      userEmail: s.user?.email || '',
      brand: s.partCodeLink?.model?.brand?.name || '',
      model: s.partCodeLink?.model?.modelName || '',
      fgCode: s.partCodeLink?.model?.fgCode || '',
      partCode: s.partCodeLink?.partCode || '',
      date: new Date(s.startTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
      startTime: new Date(s.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      endTime: s.endTime ? new Date(s.endTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '(still open)',
      duration: s.endTime ? `${mm}:${ss}` : ''
    });
  });

  return workbook.xlsx.writeBuffer();
}

module.exports = { buildSessionReportExcel };
