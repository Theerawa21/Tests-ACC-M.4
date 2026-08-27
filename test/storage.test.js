import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSubmission, saveSubmission, fetchStudents } from '../src/storage.js';

test('buildSubmission creates row-ready payload with student and grading data', () => {
  const answers = {'1':'trade','2':'nontrade'};
  const payload = buildSubmission({
    student: { name:'สมชาย ใจดี', studentClass:'ม.4/1', studentNo:'12' },
    grading: { score:8, total:10, percentage:80, passed:true },
    answers
  });
  assert.equal(payload.name, 'สมชาย ใจดี');
  assert.equal(payload.studentClass, 'ม.4/1');
  assert.equal(payload.studentNo, '12');
  assert.equal(payload.score, 8);
  assert.deepEqual(payload.answers, answers);
});

test('saveSubmission requires SHEET_WEBHOOK_URL', async () => {
  await assert.rejects(() => saveSubmission({}, {name:'A'}, async () => new Response()), /SHEET_WEBHOOK_URL/);
});

test('saveSubmission posts JSON payload and optional token', async () => {
  let captured;
  const fakeFetch = async (url, options) => {
    captured = {url, options};
    return new Response(JSON.stringify({ok:true}), {status:200, headers:{'content-type':'application/json'}});
  };
  const result = await saveSubmission(
    { SHEET_WEBHOOK_URL:'https://example.com/hook', SHEET_WEBHOOK_TOKEN:'secret' },
    {name:'A', answers:{'1':'trade'}},
    fakeFetch
  );
  assert.equal(result.ok, true);
  assert.equal(captured.url, 'https://example.com/hook');
  const body = JSON.parse(captured.options.body);
  assert.equal(body.token, 'secret');
  assert.equal(body.name, 'A');
});

test('fetchStudents reads roster for one class from Sheet webhook', async () => {
  let capturedUrl = '';
  const fakeFetch = async (url) => {
    capturedUrl = String(url);
    return new Response(JSON.stringify({
      ok:true,
      students:[{studentClass:'ม.4/3',studentNo:1,studentId:'15072',name:'นางสาวศิรภัสสร เวชบุล',status:'กำลังศึกษาอยู่'}]
    }), {status:200, headers:{'content-type':'application/json'}});
  };
  const result = await fetchStudents(
    { SHEET_WEBHOOK_URL:'https://example.com/hook', SHEET_WEBHOOK_TOKEN:'secret' },
    'ม.4/3',
    fakeFetch
  );
  assert.equal(result.students.length, 1);
  assert.equal(result.students[0].studentId, '15072');
  assert.match(capturedUrl, /action=students/);
  assert.match(capturedUrl, /class=/);
  assert.match(capturedUrl, /token=secret/);
});
