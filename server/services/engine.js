// Game engine: pure rules, no HTTP and no database.
// Works on a player-shaped object (a plain object or a Mongoose document).
import ITEMS from '../data/items.js';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/* ---------- requirements ---------- */

function itemName(id) {
  return ITEMS[id] ? ITEMS[id].name : id;
}

// Returns { ok: true } or { ok: false, reason }.
function checkRequires(player, req) {
  if (!req) return { ok: true };
  if (req.item && !player.inventory.includes(req.item)) {
    return { ok: false, reason: req.reason || `Requires: ${itemName(req.item)}` };
  }
  if (req.flag && !player.flags[req.flag]) {
    return { ok: false, reason: req.reason || 'You are missing something.' };
  }
  if (req.minFlag) {
    const have = Number(player.flags[req.minFlag.key] || 0);
    if (have < req.minFlag.value) {
      return { ok: false, reason: req.reason || 'You do not have enough evidence yet.' };
    }
  }
  return { ok: true };
}

function isHidden(player, choice) {
  const h = choice.hideIf;
  if (!h) return false;
  if (h.flag && player.flags[h.flag]) return true;
  if (h.item && player.inventory.includes(h.item)) return true;
  return false;
}

// Build the list the client sees. Ids are positional so hidden choices keep stable ids.
function listChoices(player, scene) {
  const out = [];
  let detectiveHidden = 0;
  (scene.choices || []).forEach((choice, idx) => {
    if (isHidden(player, choice)) return;
    if (choice.detective && !player.detectiveMode) {
      detectiveHidden += 1;
      return;
    }
    const gate = checkRequires(player, choice.requires);
    out.push({
      id: `c${idx}`,
      label: choice.label,
      locked: !gate.ok,
      reason: gate.ok ? null : gate.reason,
      detective: !!choice.detective,
    });
  });
  return { choices: out, detectiveHidden };
}

/* ---------- effects ---------- */

function addJournal(player, entry) {
  if (!entry || player.journal.some((j) => j.id === entry.id)) return false;
  player.journal.push({ id: entry.id, title: entry.title, text: entry.text });
  return true;
}

function applyEffects(player, effects) {
  for (const e of effects || []) {
    switch (e.type) {
      case 'health':
        player.health = clamp(player.health + e.delta, 0, 100);
        break;
      case 'alert':
        player.alert = clamp(player.alert + e.delta, 0, 100);
        break;
      case 'setAlert':
        player.alert = clamp(e.value, 0, 100);
        break;
      case 'addItem':
        if (!player.inventory.includes(e.item)) player.inventory.push(e.item);
        break;
      case 'removeItem':
        player.inventory = player.inventory.filter((i) => i !== e.item);
        break;
      case 'flag':
        player.flags[e.key] = e.value === undefined ? true : e.value;
        break;
      case 'inc':
        player.flags[e.key] = Number(player.flags[e.key] || 0) + (e.delta === undefined ? 1 : e.delta);
        break;
      case 'journal':
        addJournal(player, e);
        break;
      default:
        throw new Error(`Unknown effect type: ${e.type}`);
    }
  }
}

// Detective Mode auto-records the scene's clue.
function collectClue(player, scene) {
  if (player.detectiveMode && scene.clue) return addJournal(player, scene.clue);
  return false;
}

/* ---------- transitions ---------- */

// Moves the player into a scene, applies first-visit effects, then handles
// death (health 0) and ambush (alert 100). `getScene` is async: id -> scene | null.
async function enterScene(player, sceneId, getScene, depth = 0) {
  const target = sceneId === '__return' ? player.returnTo || 'intake_01' : sceneId;
  const scene = await getScene(target);
  if (!scene) throw new Error(`Scene not found: ${target}`);

  player.scene = scene.id;
  const first = !player.visited.includes(scene.id);
  if (first) player.visited.push(scene.id);
  if (first || scene.repeat) applyEffects(player, scene.onEnter);

  if (scene.ending) {
    player.over = true;
    return scene;
  }
  if (player.health <= 0 && depth < 3) {
    return enterScene(player, 'game_over', getScene, depth + 1);
  }
  if (player.alert >= 100 && depth < 3) {
    player.returnTo = scene.id;
    return enterScene(player, 'ambush', getScene, depth + 1);
  }
  collectClue(player, scene);
  return scene;
}

// Returns { error } or { target } after applying the choice's effects.
function resolveChoice(player, scene, choiceId) {
  const idx = Number(String(choiceId).replace(/^c/, ''));
  const choice = Number.isInteger(idx) ? (scene.choices || [])[idx] : null;
  if (!choice) return { error: 'No such choice.' };
  if (isHidden(player, choice)) return { error: 'No such choice.' };
  if (choice.detective && !player.detectiveMode) return { error: 'Nothing like that here.' };
  const gate = checkRequires(player, choice.requires);
  if (!gate.ok) return { error: gate.reason };
  applyEffects(player, choice.effects);
  return { target: choice.goto };
}

function useItem(player, itemId) {
  const item = ITEMS[itemId];
  if (!item || !player.inventory.includes(itemId)) return { error: 'You are not carrying that.' };
  if (!item.usable) return { error: 'Nothing to do with that here.' };
  applyEffects(player, item.use.effects);
  if (item.consumable) player.inventory = player.inventory.filter((i) => i !== itemId);
  return { message: item.use.message };
}

/* ---------- view model ---------- */

const withName = (player, str) => (str ? str.replace(/\{\{name\}\}/g, player.name) : str);

function buildView(player, scene, extra = {}) {
  const { choices, detectiveHidden } = listChoices(player, scene);
  const detective = !!player.detectiveMode;
  return {
    playerId: String(player._id || player.id || ''),
    name: player.name,
    scene: {
      id: scene.id,
      area: scene.area,
      title: scene.title,
      text: withName(player, scene.text),
      detectiveText: detective ? withName(player, scene.detectiveText) || null : null,
    },
    choices: scene.ending ? [] : choices,
    detectiveHint: !detective && (detectiveHidden > 0 || !!scene.detectiveText),
    hud: {
      health: player.health,
      alert: player.alert,
      detectiveMode: detective,
      inventory: player.inventory.map((id) => ({
        id,
        name: itemName(id),
        desc: ITEMS[id] ? ITEMS[id].desc : '',
        usable: !!(ITEMS[id] && ITEMS[id].usable),
      })),
      journal: player.journal.map((j) => ({ id: j.id, title: j.title, text: j.text })),
    },
    ending: scene.ending || null,
    ...extra,
  };
}

export {
  checkRequires,
  listChoices,
  applyEffects,
  collectClue,
  enterScene,
  resolveChoice,
  useItem,
  buildView,
};
