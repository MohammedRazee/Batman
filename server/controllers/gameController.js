import mongoose from 'mongoose';
import Player from '../models/Player.js';
import Scene from '../models/Scene.js';
import PlayLog from '../models/PlayLog.js';
import * as engine from '../services/engine.js';

const START_SCENE = 'intake_01';
const START_ITEMS = ['batarang'];

const getScene = (id) => Scene.findOne({ id }).lean();

function cleanName(raw) {
  const name = String(raw || '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24);
  return name;
}

async function loadPlayer(req, res) {
  const { playerId } = req.params;
  if (!mongoose.isValidObjectId(playerId)) {
    res.status(404).json({ error: 'CASE FILE NOT FOUND.' });
    return null;
  }
  const player = await Player.findById(playerId);
  if (!player) {
    res.status(404).json({ error: 'CASE FILE NOT FOUND.' });
    return null;
  }
  return player;
}

async function persist(player) {
  player.markModified('flags');
  await player.save();
}

async function syncLog(player, scene, choiceMade) {
  if (!player.logId) return;
  const update = { $set: { lastScene: scene.id } };
  if (choiceMade) update.$inc = { choicesMade: 1 };
  if (scene.ending) {
    update.$set.outcome = scene.ending.died ? 'died' : 'ending';
    update.$set.endingId = scene.ending.id;
    update.$set.endedAt = new Date();
  }
  await PlayLog.findByIdAndUpdate(player.logId, update);
}

// POST /api/game/new  { name }
export const newGame = async (req, res) => {
  const name = cleanName(req.body && req.body.name);
  if (!name) return res.status(400).json({ error: 'A name is required for the case file.' });

  const player = new Player({
    name,
    scene: START_SCENE,
    inventory: [...START_ITEMS],
    flags: {},
  });
  const log = await PlayLog.create({ playerName: name, playerId: player._id });
  player.logId = log._id;

  const scene = await engine.enterScene(player, START_SCENE, getScene);
  await persist(player);
  await syncLog(player, scene, false);
  res.status(201).json(engine.buildView(player, scene));
};

// GET /api/game/:playerId  (resume)
export const getGame = async (req, res) => {
  const player = await loadPlayer(req, res);
  if (!player) return;
  const scene = await getScene(player.scene);
  res.json(engine.buildView(player, scene));
};

// POST /api/game/:playerId/choose  { choiceId }
export const choose = async (req, res) => {
  const player = await loadPlayer(req, res);
  if (!player) return;
  if (player.over) return res.status(409).json({ error: 'This case is closed.' });

  const current = await getScene(player.scene);
  const result = engine.resolveChoice(player, current, req.body && req.body.choiceId);
  if (result.error) return res.status(400).json({ error: result.error });

  const next = await engine.enterScene(player, result.target, getScene);
  await persist(player);
  await syncLog(player, next, true);
  res.json(engine.buildView(player, next));
};

// POST /api/game/:playerId/detective  { on?: boolean }
export const toggleDetective = async (req, res) => {
  const player = await loadPlayer(req, res);
  if (!player) return;
  const on = req.body && typeof req.body.on === 'boolean' ? req.body.on : !player.detectiveMode;
  player.detectiveMode = on;
  const scene = await getScene(player.scene);
  if (!scene.ending) engine.collectClue(player, scene);
  await persist(player);
  res.json(engine.buildView(player, scene));
};

// POST /api/game/:playerId/use  { itemId }
export const useItem = async (req, res) => {
  const player = await loadPlayer(req, res);
  if (!player) return;
  if (player.over) return res.status(409).json({ error: 'This case is closed.' });

  const result = engine.useItem(player, req.body && req.body.itemId);
  if (result.error) return res.status(400).json({ error: result.error });

  let scene = await getScene(player.scene);
  if (player.health <= 0) scene = await engine.enterScene(player, 'game_over', getScene);
  await persist(player);
  await syncLog(player, scene, false);
  res.json(engine.buildView(player, scene, { message: result.message }));
};
