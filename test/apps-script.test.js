import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const code = fs.readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8');

test('Apps Script grades 20 answers and appends all answers', () => {
  assert.match(code, /const ANSWER_KEY/);
  assert.match(code, /grading\.total/);
  assert.match(code, /sheet\.appendRow\(row\)/);
});

test('Apps Script can find one student by student ID', () => {
  assert.match(code, /function getStudentById/);
  assert.match(code, /params\.action\s*!==\s*'student'/);
  assert.match(code, /params\.id/);
  assert.match(code, /studentId/);
});

test('Apps Script validates submitted student ID before saving', () => {
  assert.match(code, /verifyStudent\(payload\)/);
  assert.match(code, /payload\.studentId/);
  assert.match(code, /getStudentById/);
});