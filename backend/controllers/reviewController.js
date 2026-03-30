// Import Review model (handles DB operations for Reviews table)
const Review = require('../models/Review');
// Import validation helpers from express-validator
const { body, validationResult } = require('express-validator');

// Utility: generate a random ReviewID
// NOTE: In production you'd use auto-increment IDs or GUIDs instead
const generateReviewId = () => Math.floor(Math.random() * 1000000) + 1;

// ---------------------- Review Routes ----------------------

// Controller: Create a review for a game
const createReview = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, gameId, rentalId, rating, reviewText } = req.body;

        // Check if user is allowed to review (must have rented and returned the game)
        const canReview = await Review.canUserReview(userId, gameId);
        if (!canReview) {
            return res.status(403).json({ 
                message: 'You can only review games you have rented and returned' 
            });
        }

        // Build review object
        const reviewData = {
            ReviewID: generateReviewId(),
            UserID: userId,
            GameID: gameId,
            RentalID: rentalId,
            Rating: rating,
            ReviewText: reviewText
        };

        // Insert into DB via model
        const newReview = await Review.create(reviewData);
        res.status(201).json({ 
            message: 'Review created successfully', 
            review: newReview 
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get all reviews for a specific game
const getGameReviews = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const reviews = await Review.findByGameId(gameId);
        
        // Also fetch average rating and review count
        const ratingInfo = await Review.getAverageRating(gameId);
        
        res.json({
            reviews,
            averageRating: ratingInfo.AverageRating || 0,
            reviewCount: ratingInfo.ReviewCount || 0
        });
    } catch (error) {
        console.error('Get game reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get all reviews written by a specific user
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const reviews = await Review.findByUserId(userId);
        res.json(reviews);
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get a single review by ID
const getReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;
        
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json(review);
    } catch (error) {
        console.error('Get review by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Update an existing review
const updateReview = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { reviewId } = req.params;
        const { rating, reviewText } = req.body;

        // Check if review exists
        const existingReview = await Review.findById(reviewId);
        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Build update object
        const reviewData = {
            Rating: rating,
            ReviewText: reviewText
        };

        // Perform update
        const updated = await Review.update(reviewId, reviewData);
        if (!updated) {
            return res.status(400).json({ message: 'Failed to update review' });
        }

        // Fetch updated review to return
        const updatedReview = await Review.findById(reviewId);
        res.json({ 
            message: 'Review updated successfully', 
            review: updatedReview 
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        
        // Check if review exists
        const existingReview = await Review.findById(reviewId);
        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Perform deletion
        const deleted = await Review.delete(reviewId);
        if (!deleted) {
            return res.status(400).json({ message: 'Failed to delete review' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get all reviews (admin-only)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.getAll();
        res.json(reviews);
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Check if user can review a game
const checkCanReview = async (req, res) => {
    try {
        const { userId, gameId } = req.params;
        
        const canReview = await Review.canUserReview(userId, gameId);
        res.json({ canReview });
    } catch (error) {
        console.error('Check can review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ---------------------- Validation Middleware ----------------------

// Validation for creating a review
const validateCreateReview = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('gameId').isInt({ min: 1 }).withMessage('Valid game ID is required'),
    body('rentalId').isInt({ min: 1 }).withMessage('Valid rental ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('reviewText').optional().isLength({ max: 1000 }).withMessage('Review text must be less than 1000 characters')
];

// Validation for updating a review
const validateUpdateReview = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('reviewText').optional().isLength({ max: 1000 }).withMessage('Review text must be less than 1000 characters')
];

// Export all controller functions and validation middleware
module.exports = {
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
};
