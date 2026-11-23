import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, checkRiddle } from '../services/engine.js';
import { riddles } from '../data/riddles.js';

const clock = riddles.tr_intake_clock;

test('normalizes case, punctuation, accents, spacing, articles', () => {
  assert.equal(normalizeAnswer('  The  CLOCK!! '), 'clock');
  assert.equal(normalizeAnswer('An Écho?'), 'echo');
  assert.equal(normalizeAnswer(undefined), '');
});

test('accepts aliases, articles and plurals', () => {
  assert.ok(checkRiddle(clock, 'Wall Clock'));
  assert.ok(checkRiddle(clock, 'a clock.'));
  assert.ok(checkRiddle(clock, 'clocks'));
  assert.ok(checkRiddle(riddles.tr_medical_syringe, 'needle'));
});

test('rejects wrong or empty answers', () => {
  assert.ok(!checkRiddle(clock, 'watch'));
  assert.ok(!checkRiddle(clock, ''));
  assert.ok(!checkRiddle(clock, '   '));
});
