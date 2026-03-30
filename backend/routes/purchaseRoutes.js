const express = require('express');
const router = express.Router();
const {
    purchaseGame,
    getUserPurchases,
    getAllPurchases,
    getPurchaseById,
    joinPhysicalWaitlist,
    getUserPhysicalWaitlist,
    getGamePhysicalWaitlist,
    validatePurchaseGame,
    validateJoinPhysicalWaitlist
} = require('../controllers/purchaseController');

// Purchase routes
router.post('/purchase', validatePurchaseGame, purchaseGame);

// User purchase history
router.get('/user/:userId', getUserPurchases);
router.get('/purchase/:purchaseId', getPurchaseById);

// Physical waitlist routes
router.post('/waitlist/join', validateJoinPhysicalWaitlist, joinPhysicalWaitlist);
router.get('/waitlist/user/:userId', getUserPhysicalWaitlist);
router.get('/waitlist/game/:gameId', getGamePhysicalWaitlist);

// Admin routes (add admin authentication middleware in production)
router.get('/', getAllPurchases);

module.exports = router;
