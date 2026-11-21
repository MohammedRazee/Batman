const express = require('express');
const ctrl = require('../controllers/gameController');

const router = express.Router();

// Express 4 doesn't catch rejected promises, so wrap each handler.
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

router.post('/new', wrap(ctrl.newGame));
router.get('/:playerId', wrap(ctrl.getGame));
router.post('/:playerId/choose', wrap(ctrl.choose));
router.post('/:playerId/detective', wrap(ctrl.toggleDetective));
router.post('/:playerId/use', wrap(ctrl.useItem));

module.exports = router;
