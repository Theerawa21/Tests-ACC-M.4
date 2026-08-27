import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, gradeAnswers } from '../src/quiz.js';

test('worksheet contains exactly 20 questions', () => {
  assert.equal(QUESTIONS.length, 20);
});

test('all correct answers score 20 out of 20', () => {
  const answers = Object.fromEntries(QUESTIONS.map((q) => [String(q.id), q.answer]));
  const result = gradeAnswers(answers);
  assert.equal(result.score, 20);
  assert.equal(result.total, 20);
  assert.equal(result.percentage, 100);
  assert.equal(result.passed, true);
});

test('70 percent remains the passing threshold', () => {
  const answers = Object.fromEntries(QUESTIONS.map((q) => [String(q.id), q.answer]));
  QUESTIONS.slice(0, 6).forEach((q) => {
    answers[String(q.id)] = q.answer === 'trade' ? 'nontrade' : 'trade';
  });
  const result = gradeAnswers(answers);
  assert.equal(result.score, 14);
  assert.equal(result.percentage, 70);
  assert.equal(result.passed, true);
});

test('incomplete answers are rejected', () => {
  assert.throws(() => gradeAnswers({ '1': 'trade' }), /ตอบคำถามให้ครบทุกข้อ/);
});
