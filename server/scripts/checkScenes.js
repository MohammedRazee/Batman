// Static validation of the scene graph. Run: npm run check
import scenes from '../data/scenes/index.js';
import ITEMS from '../data/items.js';
import { riddles } from '../data/riddles.js';

const EFFECTS = new Set(['health', 'alert', 'setAlert', 'fear', 'setFear', 'addItem', 'removeItem', 'flag', 'inc', 'journal']);
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

for (const s of scenes) {
  if (!s.timed) continue;
  const { seconds, defaultChoice } = s.timed;
  const d = (s.choices || [])[defaultChoice];
  if (!d) errors.push(`${s.id}: timed.defaultChoice ${defaultChoice} does not exist`);
  else if (d.requires || d.hideIf || d.detective) errors.push(`${s.id}: timed default choice must be always available`);
  if (!(seconds >= 3 && seconds <= 15)) errors.push(`${s.id}: timed.seconds must be 3-15`);
  if (s.ending || s.id.startsWith('garden_')) errors.push(`${s.id}: timed not allowed here`);
}

const TIER_NAMES = ['calm', 'uneasy', 'terrified'];
if (!byId.get('garden_nightmare')?.fear) errors.push('garden_nightmare must exist and be a fear scene');
for (const s of scenes) {
  const hasFearEffect = [...(s.onEnter || []), ...(s.choices || []).flatMap((c) => c.effects || [])].some((e) => e.type === 'fear' || e.type === 'setFear');
  const hasLies = (s.choices || []).some((c) => c.lies);
  if (!s.fear && (s.fearText || hasLies || hasFearEffect)) errors.push(`${s.id}: fear features on a scene that is not fear: true`);
  if (s.fear && s.timed) errors.push(`${s.id}: fear scenes cannot be timed`);
  if (s.fear && s.ending) errors.push(`${s.id}: fear scene cannot be an ending`);
  for (const k of Object.keys(s.fearText || {})) if (!TIER_NAMES.includes(k) || k === 'calm') errors.push(`${s.id}: fearText key "${k}" must be uneasy or terrified`);
  (s.choices || []).forEach((c, i) => {
    if (!c.lies) return;
    if (!byId.has(c.lies.actualGoto)) errors.push(`${s.id}.c${i}: lies.actualGoto "${c.lies.actualGoto}" does not exist`);
    if (!TIER_NAMES.includes(c.lies.minTier) || c.lies.minTier === 'calm') errors.push(`${s.id}.c${i}: lies.minTier must be uneasy or terrified`);
  });
}

const usedRiddles = new Map();
for (const s of scenes) {
  if (!s.trophy) continue;
  const { riddleId, x, y } = s.trophy;
  if (!riddles[riddleId]) errors.push(`${s.id}: unknown riddle ${riddleId}`);
  if (usedRiddles.has(riddleId)) errors.push(`riddle ${riddleId} used twice`);
  usedRiddles.set(riddleId, s.id);
  if (s.ending || s.id === 'ambush' || s.id === 'game_over') errors.push(`${s.id}: trophy not allowed in ambush/death/ending`);
  if (![x, y].every((n) => Number.isFinite(n) && n >= 0 && n <= 100)) errors.push(`${s.id}: trophy x/y must be 0-100`);
}
for (const id of Object.keys(riddles)) if (!usedRiddles.has(id)) errors.push(`riddle ${id} is not placed in any scene`);

for (const f of usedFlags) if (!setFlags.has(f)) errors.push(`flag "${f}" is checked but never set`);

// reachability from the start (ambush and game_over are engine-routed)
const seen = new Set(['intake_01', 'ambush', 'game_over', 'garden_nightmare']);
const stack = ['intake_01', 'ambush', 'garden_nightmare'];
while (stack.length) {
  const s = byId.get(stack.pop());
  if (!s) continue;
  for (const c of s.choices || []) {
    for (const t of [c.goto, c.lies?.actualGoto]) {
      if (t && t !== '__return' && !seen.has(t)) {
        seen.add(t);
        stack.push(t);
      }
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
