// Runs the real engine over the real scenes with no database.
// 1) a scripted "golden path" that must reach the best ending
// 2) thousands of random playthroughs that must never dead-end
import * as engine from '../services/engine.js';
import { riddles } from '../data/riddles.js';
import scenes from '../data/scenes/index.js';

const byId = new Map(scenes.map((s) => [s.id, s]));
const getScene = async (id) => byId.get(id) || null;

const newPlayer = () => ({
  name: 'Tester',
  scene: 'intake_01',
  health: 100,
  alert: 0,
  inventory: ['batarang'],
  flags: {},
  journal: [],
  visited: [],
  returnTo: null,
  detectiveMode: false,
  trophies: [],
  riddleTries: {},
  over: false,
});

async function start() {
  const p = newPlayer();
  const scene = await engine.enterScene(p, 'intake_01', getScene);
  return { p, scene };
}

async function step(p, scene, matcher) {
  const { choices } = engine.listChoices(p, scene);
  const pick = typeof matcher === 'function' ? matcher(choices) : choices.find((c) => c.label.includes(matcher));
  if (!pick) throw new Error(`no choice matching "${matcher}" in ${scene.id}; have: ${choices.map((c) => c.label).join(' | ')}`);
  if (pick.locked) throw new Error(`choice locked in ${scene.id}: ${pick.label} (${pick.reason})`);
  const r = engine.resolveChoice(p, scene, pick.id);
  if (r.error) throw new Error(`${scene.id}: ${r.error}`);
  return engine.enterScene(p, r.target, getScene);
}

async function golden() {
  const { p, scene: s0 } = await start();
  let s = s0;
  const go = async (m) => (s = await step(p, s, m));
  const detective = (on) => {
    p.detectiveMode = on;
    engine.collectClue(p, s);
  };

  await go('Watch the prisoner');
  await go('Kneel by the guard');
  await go('Listen to the radio');
  await go('grapnel launcher');
  await go('Fire the grapnel');
  await go('Keep crawling');
  await go('Pocket the cryptographic sequencer');
  await go('Run the sequencer');
  await go('Swipe the guard keycard');
  await go('service lift');
  await go('Rest a moment');
  await go('Ride it down');
  detective(true);
  await go('Follow the one clear path');
  await go('hum behind it');
  await go('Take the antidote');
  await go('iron hatch');
  await go('Find the dry maintenance ledge');
  await go('Ring a batarang');
  await go('Climb');
  await go('Free him');
  await go('Read the patient ledger');
  await go('Back to the shelves');
  await go('Open the scorched wall safe');
  await go('Pocket the evidence');
  await go('Trace the blood trail');
  await go('Climb back up');
  await go('service stairs');
  await go('Climb to the Tower');
  await go('Trace the wires');
  await go('Walk in');
  await go('Drink the antidote');
  await go('Cut the wires');
  if (s.ending?.id !== 'justice') throw new Error(`golden path ended in ${s.id}`);
  if (!p.over) throw new Error('player not marked over');
  console.log(`[sim] golden path OK  health=${p.health} alert=${p.alert} evidence=${p.flags.evidence} journal=${p.journal.length}`);
}

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function randomRuns(n) {
  const endings = {};
  const unseen = new Set(scenes.map((s) => s.id));
  let maxSteps = 0;
  for (let i = 0; i < n; i++) {
    const rand = rng(i + 1);
    const { p, scene } = await start();
    let s = scene;
    let steps = 0;
    while (!p.over) {
      if (++steps > 600) throw new Error(`run ${i} did not terminate (stuck near ${s.id})`);
      if (rand() < 0.15) {
        p.detectiveMode = !p.detectiveMode;
        engine.collectClue(p, s);
      }
      if (s.trophy && p.detectiveMode && rand() < 0.5) {
        const id = s.trophy.riddleId;
        const res = engine.answerRiddle(p, id, rand() < 0.5 ? 'zzz' : riddles[id].answers[0]);
        if (res.correct !== p.trophies.includes(id)) throw new Error(`run ${i}: riddle state mismatch at ${s.id}`);
        const view = JSON.stringify(engine.buildView(p, s));
        if (!p.trophies.includes(id) && riddles[id].answers.some((a) => view.includes(`"${a}"`))) throw new Error(`answer leaked in view at ${s.id}`);
      }
      const { choices } = engine.listChoices(p, s);
      const open = choices.filter((c) => !c.locked);
      if (!open.length) throw new Error(`run ${i}: dead end at ${s.id} (no unlocked choices)`);
      const pick = open[Math.floor(rand() * open.length)];
      const r = engine.resolveChoice(p, s, pick.id);
      if (r.error) throw new Error(`run ${i}: ${s.id} offered ${pick.id} but resolve said ${r.error}`);
      s = await engine.enterScene(p, r.target, getScene);
      unseen.delete(s.id);
      if (p.health < 0 || p.health > 100 || p.alert < 0 || p.alert > 100) throw new Error('meter out of range');
    }
    maxSteps = Math.max(maxSteps, steps);
    endings[s.ending.id] = (endings[s.ending.id] || 0) + 1;
  }
  console.log(`[sim] ${n} random runs OK, longest=${maxSteps} steps, endings:`, endings);
  const hide = new Set(['ambush']);
  const never = [...unseen].filter((x) => !hide.has(x));
  if (never.length) console.log('[sim] scenes never reached by random play:', never.join(', '));
}

(async () => {
  try {
    await golden();
    await randomRuns(3000);
  } catch (e) {
    console.error('[sim] FAIL:', e.message);
    process.exit(1);
  }
})();
