const express = require('express');
const router = express.Router();
const {
    rentGame,
    returnGame,
    getUserRentals,
    getActiveRentals,
    deleteRental,
    getAllRentals,
    getOverdueRentals,
    joinDigitalWaitlist,
    getUserWaitlist,
    getGameWaitlist,
    validateRentGame,
    validateJoinWaitlist
} = require('../controllers/rentalController');

// Rental routes
router.post('/rent', validateRentGame, rentGame);
router.put('/return/:rentalId', returnGame);
router.delete('/:rentalId', deleteRental);

// User rental history
router.get('/user/:userId', getUserRentals);
router.get('/user/:userId/active', getActiveRentals);

// Waitlist routes
router.post('/waitlist/join', validateJoinWaitlist, joinDigitalWaitlist);
router.get('/waitlist/user/:userId', getUserWaitlist);
router.get('/waitlist/game/:gameId', getGameWaitlist);

// Admin routes (add admin authentication middleware in production)
router.get('/', getAllRentals);
router.get('/overdue', getOverdueRentals);

module.exports = router;
