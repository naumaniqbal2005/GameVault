const express = require('express');
const router = express.Router();
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

// Review routes
router.post('/', validateCreateReview, createReview);
router.get('/game/:gameId', getGameReviews);
router.get('/user/:userId', getUserReviews);
router.get('/review/:reviewId', getReviewById);
router.get('/can-review/:userId/:gameId', checkCanReview);

// Update/Delete review (user should only be able to modify their own reviews)
router.put('/review/:reviewId', validateUpdateReview, updateReview);
router.delete('/review/:reviewId', deleteReview);

// Admin routes (add admin authentication middleware in production)
router.get('/', getAllReviews);

module.exports = router;
