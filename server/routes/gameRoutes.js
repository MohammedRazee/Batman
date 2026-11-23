import express from 'express';
import * as ctrl from '../controllers/gameController.js';

const router = express.Router();

// Express 4 doesn't catch rejected promises, so wrap each handler.
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

router.post('/new', wrap(ctrl.newGame));
router.get('/:playerId', wrap(ctrl.getGame));
router.post('/:playerId/choose', wrap(ctrl.choose));
router.post('/:playerId/detective', wrap(ctrl.toggleDetective));
router.get('/:playerId/riddle/:riddleId', wrap(ctrl.getRiddle));
router.post('/:playerId/riddle/:riddleId', wrap(ctrl.postRiddle));
router.post('/:playerId/use', wrap(ctrl.useItem));

export default router;
