// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions and validation middleware
const {
    createReview,
    getGameReviews,
    getUserReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getAllReviews,
    checkCanReview,
    validateCreateReview,
    validateUpdateReview
} = require('../controllers/reviewController');

// ---------------------- Review Routes ----------------------
// Handle creating and fetching reviews for games

// POST /reviews → Create a new review for a game
router.post('/', validateCreateReview, createReview);

// GET /reviews/game/:gameId → Get all reviews for a specific game (includes average rating)
router.get('/game/:gameId', getGameReviews);

// GET /reviews/user/:userId → Get all reviews written by a specific user
router.get('/user/:userId', getUserReviews);

// GET /reviews/review/:reviewId → Get a single review by ID
router.get('/review/:reviewId', getReviewById);

// GET /reviews/can-review/:userId/:gameId → Check if a user can review a specific game
router.get('/can-review/:userId/:gameId', checkCanReview);

// ---------------------- Update/Delete Review ----------------------
// Users should only be able to modify their own reviews (add authentication in production)

// PUT /reviews/review/:reviewId → Update an existing review
router.put('/review/:reviewId', validateUpdateReview, updateReview);

// DELETE /reviews/review/:reviewId → Delete a review
router.delete('/review/:reviewId', deleteReview);

// ---------------------- Admin Routes ----------------------
// In production, add admin authentication middleware before these routes
// Example: router.get('/', adminAuthMiddleware, getAllReviews);

// GET /reviews → Get all reviews (admin-only)
router.get('/', getAllReviews);

// Export router so it can be mounted in server.js or app.js
module.exports = router;
