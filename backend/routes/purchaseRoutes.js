// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions and validation middleware
const {
    purchaseGame,
    getUserPurchases,
    getAllPurchases,
    getPurchaseById,
    joinPhysicalWaitlist,
    getUserPhysicalWaitlist,
    getGamePhysicalWaitlist,
    deleteWaitlist,
    validatePurchaseGame,
    validateJoinPhysicalWaitlist
} = require('../controllers/purchaseController');

// ---------------------- Purchase Routes ----------------------
// Handle buying physical copies of games

// POST /purchase/purchase → Buy a physical copy of a game
router.post('/purchase', validatePurchaseGame, purchaseGame);

// ---------------------- User Purchase History ----------------------
// Fetch purchase history for a specific user or purchase details by ID

// GET /purchase/user/:userId → Get all purchases made by a specific user
router.get('/user/:userId', getUserPurchases);

// GET /purchase/purchase/:purchaseId → Get details of a single purchase by ID
router.get('/purchase/:purchaseId', getPurchaseById);

// ---------------------- Physical Waitlist Routes ----------------------
// Manage waitlists for physical copies of games

// POST /purchase/waitlist/join → Add a user to the waitlist for a game
router.post('/waitlist/join', validateJoinPhysicalWaitlist, joinPhysicalWaitlist);

// GET /purchase/waitlist/user/:userId → Get waitlist entries for a specific user
router.get('/waitlist/user/:userId', getUserPhysicalWaitlist);

// GET /purchase/waitlist/game/:gameId → Get waitlist entries for a specific game
router.get('/waitlist/game/:gameId', getGamePhysicalWaitlist);

router.delete('/waitlist/:waitlistId', deleteWaitlist);
// ---------------------- Admin Routes ----------------------
// In production, add admin authentication middleware before these routes
// Example: router.get('/', adminAuthMiddleware, getAllPurchases);

// GET /purchase → Get all purchases (admin-only)
router.get('/', getAllPurchases);

// Export router so it can be mounted in server.js or app.js
module.exports = router;
