const SPREADSHEET_ID = '1gGdbd8qzEwABC9snWeOqkNh2LUc_7uRdtgzqx9EFSc8';
const RESULT_SHEET_NAME = 'ผลการทำใบงาน';
const STUDENT_SHEET_NAME = 'ข้อมูลนักเรียน';

const ANSWER_KEY = {
  '1':'trade','2':'trade','3':'nontrade','4':'nontrade','5':'trade',
  '6':'nontrade','7':'trade','8':'nontrade','9':'trade','10':'nontrade',
  '11':'trade','12':'nontrade','13':'trade','14':'trade','15':'nontrade',
  '16':'trade','17':'nontrade','18':'trade','19':'trade','20':'nontrade'
};

function jsOutput(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function safeCallback(value) {
  const callback = String(value || '').trim();
  return /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback) ? callback : '';
}

function getStudents(studentClass) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(STUDENT_SHEET_NAME);
  if (!sheet) throw new Error('Student sheet not found');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, 5).getValues()
    .filter(row => String(row[0]).trim() === studentClass && String(row[3]).trim())
    .map(row => ({
      studentClass: String(row[0]).trim(),
      studentNo: Number(row[1]),
      studentId: String(row[2]).trim(),
      name: String(row[3]).trim(),
      status: String(row[4]).trim()
    }))
    .sort((a, b) => a.studentNo - b.studentNo);
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = safeCallback(params.callback);
  try {
    if (params.action !== 'students') {
      const data = { ok:true, service:'Tests-ACC-M4 Google Sheet API' };
      return callback ? jsOutput(callback + '(' + JSON.stringify(data) + ');') : jsOutput('console.log(' + JSON.stringify(data) + ');');
    }
    const studentClass = String(params.class || '').trim();
    if (!studentClass) throw new Error('Missing class');
    const data = { ok:true, students:getStudents(studentClass) };
    return callback ? jsOutput(callback + '(' + JSON.stringify(data) + ');') : jsOutput('console.log(' + JSON.stringify(data) + ');');
  } catch (error) {
    const data = { ok:false, error:String(error && error.message ? error.message : error) };
    return callback ? jsOutput(callback + '(' + JSON.stringify(data) + ');') : jsOutput('console.error(' + JSON.stringify(data) + ');');
  }
}

function gradeAnswers(answers) {
  let score = 0;
  Object.keys(ANSWER_KEY).forEach(key => {
    if (!answers || !['trade','nontrade'].includes(answers[key])) throw new Error('ตอบคำถามให้ครบทุกข้อ');
    if (answers[key] === ANSWER_KEY[key]) score++;
  });
  const total = Object.keys(ANSWER_KEY).length;
  const percentage = Math.round(score / total * 100);
  return { score, total, percentage, passed: percentage >= 70 };
}

function verifyStudent(payload) {
  const students = getStudents(String(payload.studentClass || '').trim());
  return students.some(s =>
    String(s.studentNo) === String(payload.studentNo) &&
    s.name === String(payload.name || '').trim()
  );
}

function iframeResponse(data) {
  const safe = JSON.stringify(Object.assign({ source:'tests-acc-m4' }, data)).replace(/</g, '\\u003c');
  return HtmlService
    .createHtmlOutput('<!doctype html><meta charset="utf-8"><script>parent.postMessage(' + safe + ', "*");<\/script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const raw = e && e.parameter ? e.parameter.payload : '';
    const payload = JSON.parse(raw || '{}');
    const required = ['name','studentClass','studentNo','answers'];
    required.forEach(key => { if (payload[key] === undefined || payload[key] === null || payload[key] === '') throw new Error('Missing field: ' + key); });
    if (!verifyStudent(payload)) throw new Error('ไม่พบข้อมูลนักเรียนในฐานข้อมูล');

    const grading = gradeAnswers(payload.answers);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(RESULT_SHEET_NAME);
    if (!sheet) throw new Error('Result sheet not found');

    const answerLabel = value => value === 'trade' ? 'เป็นรายการค้า' : 'ไม่เป็นรายการค้า';
    const row = [
      new Date(), String(payload.name).trim(), String(payload.studentClass).trim(), Number(payload.studentNo),
      grading.score, grading.total, grading.percentage, grading.passed ? 'ผ่าน' : 'ควรทบทวน'
    ];
    for (let i = 1; i <= grading.total; i++) row.push(answerLabel(payload.answers[String(i)]));
    sheet.appendRow(row);

    return iframeResponse({ ok:true, row:sheet.getLastRow(), score:grading.score, total:grading.total, percentage:grading.percentage, passed:grading.passed });
  } catch (error) {
    return iframeResponse({ ok:false, error:String(error && error.message ? error.message : error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
