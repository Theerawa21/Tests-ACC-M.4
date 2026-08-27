const SPREADSHEET_ID = '1gGdbd8qzEwABC9snWeOqkNh2LUc_7uRdtgzqx9EFSc8';
const SHEET_NAME = 'ผลการทำใบงาน';

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return jsonOutput({ ok: true, service: 'Tests-ACC-M4 Sheet Webhook' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const payload = JSON.parse(e.postData.contents || '{}');
    const expectedToken = PropertiesService.getScriptProperties().getProperty('WEBHOOK_TOKEN') || '';
    if (expectedToken && payload.token !== expectedToken) {
      return jsonOutput({ ok: false, error: 'Unauthorized' });
    }

    const required = ['name', 'studentClass', 'studentNo', 'score', 'total', 'percentage', 'answers'];
    for (const key of required) {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        return jsonOutput({ ok: false, error: 'Missing field: ' + key });
      }
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return jsonOutput({ ok: false, error: 'Sheet not found' });

    const answerLabel = (value) => value === 'trade' ? 'เป็นรายการค้า' : 'ไม่เป็นรายการค้า';
    const row = [
      new Date(),
      payload.name,
      payload.studentClass,
      Number(payload.studentNo),
      Number(payload.score),
      Number(payload.total),
      Number(payload.percentage),
      payload.passed ? 'ผ่าน' : 'ควรทบทวน'
    ];
    for (let i = 1; i <= 10; i++) row.push(answerLabel(payload.answers[String(i)]));

    sheet.appendRow(row);
    return jsonOutput({ ok: true, row: sheet.getLastRow() });
  } catch (error) {
    return jsonOutput({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
