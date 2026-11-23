import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveChoice } from '../services/engine.js';

const player = () => ({ inventory: [], flags: {}, journal: [], health: 100, alert: 0, detectiveMode: false });
const scene = {
  timed: { seconds: 5, defaultChoice: 1 },
  choices: [{ label: 'a', goto: 'x' }, { label: 'b', goto: 'y' }],
};

test('timeout on the default choice resolves to it', () => {
  assert.equal(resolveChoice(player(), scene, 'c1', true).target, 'y');
});

test('timeout with a non-default choice is rejected', () => {
  assert.ok(resolveChoice(player(), scene, 'c0', true).error);
});

test('timeout on an untimed scene is rejected', () => {
  assert.ok(resolveChoice(player(), { choices: scene.choices }, 'c1', true).error);
});
