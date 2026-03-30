const express = require('express');
const router = express.Router();
const {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    getAvailablePhysicalCopies,
    getAvailableDigitalCopies,
    validateCreateGame,
    validateUpdateGame
} = require('../controllers/gameController');

// Public routes
router.get('/', getAllGames);
router.get('/:gameId', getGameById);
router.get('/:gameId/physical-copies', getAvailablePhysicalCopies);
router.get('/:gameId/digital-copies', getAvailableDigitalCopies);

// Admin routes (add admin authentication middleware in production)
router.post('/', validateCreateGame, createGame);
router.put('/:gameId', validateUpdateGame, updateGame);
router.delete('/:gameId', deleteGame);

module.exports = router;
