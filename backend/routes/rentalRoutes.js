// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions and validation middleware
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

// ---------------------- Rental Routes ----------------------
// Handle renting and returning digital copies of games

// POST /rental/rent → Rent a digital game
router.post('/rent', validateRentGame, rentGame);

// PUT /rental/return/:rentalId → Return a rented game
router.put('/return/:rentalId', returnGame);

// DELETE /rental/:rentalId → Delete a rental record (admin-only)
router.delete('/:rentalId', deleteRental);

// ---------------------- User Rental History ----------------------
// Fetch rental history and active rentals for a specific user

// GET /rental/user/:userId → Get all rentals for a user
router.get('/user/:userId', getUserRentals);

// GET /rental/user/:userId/active → Get active rentals for a user
router.get('/user/:userId/active', getActiveRentals);

// ---------------------- Digital Waitlist Routes ----------------------
// Manage waitlists for digital copies of games

// POST /rental/waitlist/join → Add a user to the digital waitlist
router.post('/waitlist/join', validateJoinWaitlist, joinDigitalWaitlist);

// GET /rental/waitlist/user/:userId → Get waitlist entries for a specific user
router.get('/waitlist/user/:userId', getUserWaitlist);

// GET /rental/waitlist/game/:gameId → Get waitlist entries for a specific game
router.get('/waitlist/game/:gameId', getGameWaitlist);

// ---------------------- Admin Routes ----------------------
// In production, add admin authentication middleware before these routes
// Example: router.get('/', adminAuthMiddleware, getAllRentals);

// GET /rental → Get all rentals (admin-only)
router.get('/', getAllRentals);

// GET /rental/overdue → Get overdue rentals (admin-only)
router.get('/overdue', getOverdueRentals);

// Export router so it can be mounted in server.js or app.js
module.exports = router;
