import test from 'node:test';
import assert from 'node:assert/strict';
import { fearTier, applyEffects, resolveChoice, listChoices, enterScene, buildView } from '../services/engine.js';

const player = (o = {}) => ({ name: 'T', inventory: [], flags: {}, journal: [], visited: [], trophies: [], riddleTries: {}, health: 100, alert: 0, fear: 0, detectiveMode: false, ...o });
const scenes = {
  a: { id: 'a', fear: true, text: 'calm', fearText: { uneasy: 'uneasy' }, choices: [{ label: 'x', goto: 'out', lies: { actualGoto: 'b', minTier: 'uneasy' } }] },
  b: { id: 'b', fear: true, text: 'b', choices: [{ label: 'y', goto: 'out' }] },
  out: { id: 'out', text: 'outside', choices: [{ label: 'z', goto: 'out' }] },
  garden_nightmare: { id: 'garden_nightmare', fear: true, repeat: true, text: 'n', onEnter: [{ type: 'setFear', value: 60 }], choices: [{ label: 'up', goto: '__return' }] },
};
const get = async (id) => scenes[id];

test('tier boundaries', () => {
  assert.deepEqual([0, 33, 34, 66, 67, 100].map(fearTier), ['calm', 'calm', 'uneasy', 'uneasy', 'terrified', 'terrified']);
});

test('fear effect clamps to 0-100', () => {
  const p = player();
  applyEffects(p, [{ type: 'fear', delta: 150 }]);
  assert.equal(p.fear, 100);
  applyEffects(p, [{ type: 'fear', delta: -500 }]);
  assert.equal(p.fear, 0);
});

test('lie only applies at or above minTier', () => {
  assert.equal(resolveChoice(player({ fear: 10 }), scenes.a, 'c0').target, 'out');
  assert.equal(resolveChoice(player({ fear: 40 }), scenes.a, 'c0').target, 'b');
});

test('lie marker and alert cost only in Detective Mode, once', async () => {
  assert.equal(listChoices(player({ fear: 40 }), scenes.a).choices[0].lie, false);
  const p = player({ fear: 40, detectiveMode: true });
  assert.equal(listChoices(p, scenes.a).choices[0].lie, true);
  await enterScene(p, 'a', get);
  assert.equal(p.alert, 5);
  p.visited = [];
  await enterScene(p, 'a', get);
  assert.equal(p.alert, 5);
});

test('scene text follows the tier with fallback', () => {
  assert.equal(buildView(player({ fear: 0 }), scenes.a).scene.text, 'calm');
  assert.equal(buildView(player({ fear: 40 }), scenes.a).scene.text, 'uneasy');
  assert.equal(buildView(player({ fear: 90 }), scenes.a).scene.text, 'uneasy');
  assert.equal(buildView(player({ fear: 90 }), scenes.out).fear, null);
});

test('max fear diverts to the nightmare, then returns to the target', async () => {
  const p = player({ fear: 100 });
  const s = await enterScene(p, 'b', get);
  assert.equal(s.id, 'garden_nightmare');
  assert.equal(p.fear, 60);
  const back = await enterScene(p, '__return', get);
  assert.equal(back.id, 'b');
});

test('leaving the section resets fear and sets one exit flag', async () => {
  const p = player();
  applyEffects(p, [{ type: 'fear', delta: 80 }]);
  await enterScene(p, 'out', get);
  assert.equal(p.fear, 0);
  assert.equal(p.flags.shaken, true);
  assert.equal(p.flags.lucid, false);
  assert.equal(p.flags.fearPeak, undefined);

  const q = player();
  applyEffects(q, [{ type: 'fear', delta: 20 }]);
  await enterScene(q, 'out', get);
  assert.equal(q.flags.lucid, true);
  assert.equal(q.flags.shaken, false);
});
