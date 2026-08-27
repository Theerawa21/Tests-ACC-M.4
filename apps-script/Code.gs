const SPREADSHEET_ID = '1gGdbd8qzEwABC9snWeOqkNh2LUc_7uRdtgzqx9EFSc8';
const RESULT_SHEET_NAME = 'ผลการทำใบงาน';
const STUDENT_SHEET_NAME = 'ข้อมูลนักเรียน';

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function isAuthorized(token) {
  const expectedToken = PropertiesService.getScriptProperties().getProperty('WEBHOOK_TOKEN') || '';
  return !expectedToken || token === expectedToken;
}

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    if (params.action !== 'students') {
      return jsonOutput({ ok: true, service: 'Tests-ACC-M4 Sheet Webhook' });
    }
    if (!isAuthorized(params.token || '')) {
      return jsonOutput({ ok: false, error: 'Unauthorized' });
    }

    const studentClass = String(params.class || '').trim();
    if (!studentClass) return jsonOutput({ ok: false, error: 'Missing class' });

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(STUDENT_SHEET_NAME);
    if (!sheet) return jsonOutput({ ok: false, error: 'Student sheet not found' });

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return jsonOutput({ ok: true, students: [] });

    const rows = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    const students = rows
      .filter(row => String(row[0]).trim() === studentClass && String(row[3]).trim())
      .map(row => ({
        studentClass: String(row[0]).trim(),
        studentNo: Number(row[1]),
        studentId: String(row[2]).trim(),
        name: String(row[3]).trim(),
        status: String(row[4]).trim()
      }))
      .sort((a, b) => a.studentNo - b.studentNo);

    return jsonOutput({ ok: true, students: students });
  } catch (error) {
    return jsonOutput({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!isAuthorized(payload.token || '')) {
      return jsonOutput({ ok: false, error: 'Unauthorized' });
    }

    const required = ['name', 'studentClass', 'studentNo', 'score', 'total', 'percentage', 'answers'];
    for (const key of required) {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        return jsonOutput({ ok: false, error: 'Missing field: ' + key });
      }
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(RESULT_SHEET_NAME);
    if (!sheet) return jsonOutput({ ok: false, error: 'Result sheet not found' });

    const answerLabel = value => value === 'trade' ? 'เป็นรายการค้า' : 'ไม่เป็นรายการค้า';
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
