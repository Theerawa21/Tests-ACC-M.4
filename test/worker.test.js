import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

test('GET / returns Thai worksheet HTML', async () => {
  const response = await worker.fetch(new Request('https://example.com/'));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(html, /รายการค้าและรายการที่ไม่ใช่รายการค้า/);
  assert.match(html, /ชื่อ–นามสกุล/);
});

test('POST /api/check grades all-correct answers', async () => {
  const answers = {
    '1':'trade','2':'trade','3':'nontrade','4':'nontrade','5':'trade',
    '6':'nontrade','7':'trade','8':'nontrade','9':'trade','10':'nontrade'
  };
  const request = new Request('https://example.com/api/check', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ answers })
  });
  const response = await worker.fetch(request);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.score, 10);
  assert.equal(data.passed, true);
});

test('unknown route returns 404', async () => {
  const response = await worker.fetch(new Request('https://example.com/nope'));
  assert.equal(response.status, 404);
});
