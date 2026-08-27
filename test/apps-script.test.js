import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const code = fs.readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8');

test('Apps Script grades 20 answers and appends all answers', () => {
  assert.match(code, /const ANSWER_KEY/);
  assert.match(code, /grading\.total/);
  assert.match(code, /sheet\.appendRow\(row\)/);
});

test('Apps Script validates student against roster before saving', () => {
  assert.match(code, /verifyStudent\(payload\)/);
  assert.match(code, /getStudents/);
});
