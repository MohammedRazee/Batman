// Static validation of the scene graph. Run: npm run check
import scenes from '../data/scenes/index.js';
import ITEMS from '../data/items.js';

const EFFECTS = new Set(['health', 'alert', 'setAlert', 'addItem', 'removeItem', 'flag', 'inc', 'journal']);
const byId = new Map();
const errors = [];
const warn = [];

for (const s of scenes) {
  if (byId.has(s.id)) errors.push(`duplicate scene id: ${s.id}`);
  byId.set(s.id, s);
}

const setFlags = new Set();
const usedFlags = new Set();

function checkEffects(where, effects) {
  for (const e of effects || []) {
    if (!EFFECTS.has(e.type)) errors.push(`${where}: unknown effect ${e.type}`);
    if ((e.type === 'addItem' || e.type === 'removeItem') && !ITEMS[e.item]) errors.push(`${where}: unknown item ${e.item}`);
    if (e.type === 'flag' || e.type === 'inc') setFlags.add(e.key);
  }
}

for (const s of scenes) {
  checkEffects(`${s.id}.onEnter`, s.onEnter);
  if (!s.ending && !(s.choices || []).length) errors.push(`${s.id}: no choices and not an ending`);
  if (s.ending && (s.choices || []).length) errors.push(`${s.id}: ending scene has choices`);
  (s.choices || []).forEach((c, i) => {
    const w = `${s.id}.c${i}`;
    if (c.goto !== '__return' && !byId.has(c.goto)) errors.push(`${w}: goto "${c.goto}" does not exist`);
    checkEffects(w, c.effects);
    if (c.requires) {
      if (c.requires.item && !ITEMS[c.requires.item]) errors.push(`${w}: unknown required item`);
      if (c.requires.flag) usedFlags.add(c.requires.flag);
      if (c.requires.minFlag) usedFlags.add(c.requires.minFlag.key);
    }
    if (c.hideIf) {
      if (c.hideIf.flag) usedFlags.add(c.hideIf.flag);
      if (c.hideIf.item && !ITEMS[c.hideIf.item]) errors.push(`${w}: unknown hideIf item`);
    }
  });
}

for (const f of usedFlags) if (!setFlags.has(f)) errors.push(`flag "${f}" is checked but never set`);

// reachability from the start (ambush and game_over are engine-routed)
const seen = new Set(['intake_01', 'ambush', 'game_over']);
const stack = ['intake_01', 'ambush'];
while (stack.length) {
  const s = byId.get(stack.pop());
  if (!s) continue;
  for (const c of s.choices || []) {
    if (c.goto !== '__return' && !seen.has(c.goto)) {
      seen.add(c.goto);
      stack.push(c.goto);
    }
  }
}
for (const s of scenes) if (!seen.has(s.id)) errors.push(`unreachable scene: ${s.id}`);

console.log(`[check] ${scenes.length} scenes, ${[...scenes].filter((s) => s.ending).length} terminal`);
warn.forEach((w) => console.warn('[warn]', w));
if (errors.length) {
  errors.forEach((e) => console.error('[error]', e));
  process.exit(1);
}
console.log('[check] scene graph OK');
