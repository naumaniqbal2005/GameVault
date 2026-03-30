const Review = require('../models/Review');
const { body, validationResult } = require('express-validator');

// Generate a simple review ID (in production, use proper ID generation)
const generateReviewId = () => Math.floor(Math.random() * 1000000) + 1;

// Create a review for a game
const createReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, gameId, rentalId, rating, reviewText } = req.body;

        // Check if user can review this game (must have rented and returned it)
        const canReview = await Review.canUserReview(userId, gameId);
        if (!canReview) {
            return res.status(403).json({ 
                message: 'You can only review games you have rented and returned' 
            });
        }

        const reviewData = {
            ReviewID: generateReviewId(),
            UserID: userId,
            GameID: gameId,
            RentalID: rentalId,
            Rating: rating,
            ReviewText: reviewText
        };

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

// Get reviews for a game
const getGameReviews = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const reviews = await Review.findByGameId(gameId);
        
        // Get average rating
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

// Get user's reviews
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

// Get review by ID
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

// Update a review
const updateReview = async (req, res) => {
    try {
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

        const reviewData = {
            Rating: rating,
            ReviewText: reviewText
        };

        const updated = await Review.update(reviewId, reviewData);
        if (!updated) {
            return res.status(400).json({ message: 'Failed to update review' });
        }

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

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        
        // Check if review exists
        const existingReview = await Review.findById(reviewId);
        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

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

// Get all reviews (admin function)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.getAll();
        res.json(reviews);
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if user can review a game
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

// Validation middleware
const validateCreateReview = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('gameId').isInt({ min: 1 }).withMessage('Valid game ID is required'),
    body('rentalId').isInt({ min: 1 }).withMessage('Valid rental ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('reviewText').optional().isLength({ max: 1000 }).withMessage('Review text must be less than 1000 characters')
];

const validateUpdateReview = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('reviewText').optional().isLength({ max: 1000 }).withMessage('Review text must be less than 1000 characters')
];

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
