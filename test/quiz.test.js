import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, gradeAnswers } from '../src/quiz.js';

test('worksheet contains exactly 10 questions', () => {
  assert.equal(QUESTIONS.length, 10);
});

test('all correct answers score 10 out of 10', () => {
  const answers = Object.fromEntries(QUESTIONS.map((q) => [String(q.id), q.answer]));
  const result = gradeAnswers(answers);
  assert.equal(result.score, 10);
  assert.equal(result.total, 10);
  assert.equal(result.percentage, 100);
  assert.equal(result.passed, true);
});

test('incomplete answers are rejected', () => {
  assert.throws(() => gradeAnswers({ '1': 'trade' }), /ตอบคำถามให้ครบทุกข้อ/);
});
