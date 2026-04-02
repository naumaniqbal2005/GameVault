// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions and validation middleware
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

// ---------------------- Public Routes ----------------------
// These routes are accessible without admin privileges

// GET /games → Fetch all games (supports filters via query params)
router.get('/', getAllGames);

// GET /games/:gameId → Fetch a single game by ID
router.get('/:gameId', getGameById);

// GET /games/:gameId/physical-copies → Fetch available physical copies of a game
router.get('/:gameId/physical-copies', getAvailablePhysicalCopies);

// GET /games/:gameId/digital-copies → Fetch available digital copies of a game
router.get('/:gameId/digital-copies', getAvailableDigitalCopies);

// ---------------------- Admin Routes ----------------------
// In production, add admin authentication middleware before these routes
// Example: router.post('/', adminAuthMiddleware, validateCreateGame, createGame);

// POST /games → Create a new game
router.post('/', validateCreateGame, createGame);

// PUT /games/:gameId → Update an existing game
router.put('/:gameId', validateUpdateGame, updateGame);

// DELETE /games/:gameId → Delete a game
router.delete('/:gameId', deleteGame);

// Export router so it can be mounted in server.js or app.js
module.exports = router;
