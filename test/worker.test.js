import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const ALL_CORRECT = {
  '1':'trade','2':'trade','3':'nontrade','4':'nontrade','5':'trade',
  '6':'nontrade','7':'trade','8':'nontrade','9':'trade','10':'nontrade'
};

test('GET / returns mobile-first Thai worksheet that submits to /api/submit', async () => {
  const response = await worker.fetch(new Request('https://example.com/'), {});
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /รายการค้าและรายการที่ไม่ใช่รายการค้า/);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /class="mobile-progress"/);
  assert.match(html, /\/api\/submit/);
  assert.match(html, /บันทึกผลลง Google Sheet/);
});

test('POST /api/submit grades answers but reports unsaved when webhook is not configured', async () => {
  const request = new Request('https://example.com/api/submit', {
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
      name:'สมชาย ใจดี', studentClass:'ม.4/1', studentNo:'12', answers:ALL_CORRECT
    })
  });
  const response = await worker.fetch(request, {});
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.equal(data.score, 10);
  assert.equal(data.saved, false);
  assert.match(data.error, /SHEET_WEBHOOK_URL/);
});

test('POST /api/check remains available for grading-only compatibility', async () => {
  const request = new Request('https://example.com/api/check', {
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({answers:ALL_CORRECT})
  });
  const response = await worker.fetch(request, {});
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.score, 10);
});

test('unknown route returns 404', async () => {
  const response = await worker.fetch(new Request('https://example.com/nope'), {});
  assert.equal(response.status, 404);
});
