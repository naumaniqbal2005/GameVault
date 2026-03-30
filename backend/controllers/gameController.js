// Import Game and Category models (DB operations for Games and Categories tables)
const Game = require('../models/Game');
const Category = require('../models/Category');
// Import validation helpers from express-validator
const { body, validationResult } = require('express-validator');

// Utility: generate a random GameID
// NOTE: In production you'd use auto-increment IDs or GUIDs instead
const generateGameId = () => Math.floor(Math.random() * 1000000) + 1;

// Controller: Get all games with optional filters
const getAllGames = async (req, res) => {
    try {
        // Extract filters from query string (category, platform, genre, search term)
        const filters = {
            category: req.query.category,
            platform: req.query.platform,
            genre: req.query.genre,
            search: req.query.search
        };

        // Fetch games from DB using filters
        const games = await Game.getAll(filters);
        // Return games along with applied filters
        res.json({ 
            message: 'Games retrieved successfully', 
            games: games,
            filters: filters
        });
    } catch (error) {
        console.error('Get all games error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get game by ID
const getGameById = async (req, res) => {
    try {
        // Extract gameId from URL params
        const { gameId } = req.params;
        
        // Query DB for game by ID
        const game = await Game.findById(gameId);
        if (!game) {
            // If not found, return 404
            return res.status(404).json({ message: 'Game not found' });
        }

        // Return game if found
        res.json({ 
            message: 'Game retrieved successfully', 
            game: game 
        });
    } catch (error) {
        console.error('Get game by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Create new game (admin-only)
const createGame = async (req, res) => {
    try {
        // Run validation checks
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If validation fails, return 400 with error details
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract fields from request body
        const { gameTitle, platform, genre, categoryId, physicalPrice, digitalRentalPrice } = req.body;

        // If categoryId is provided, check if category exists
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Invalid category' });
            }
        }

        // Build game object with generated ID
        const gameData = {
            GameID: generateGameId(),
            GameTitle: gameTitle,
            Platform: platform,
            Genre: genre,
            CategoryID: categoryId || null,
            PhysicalPrice: physicalPrice || 0,
            DigitalRentalPrice: digitalRentalPrice || 0
        };

        // Insert into DB via model
        const newGame = await Game.create(gameData);
        // Return success response with created game
        res.status(201).json({ 
            message: 'Game created successfully', 
            game: newGame 
        });
    } catch (error) {
        console.error('Create game error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Update game (admin-only)
const updateGame = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract gameId from URL and new fields from body
        const { gameId } = req.params;
        const { gameTitle, platform, genre, categoryId, physicalPrice, digitalRentalPrice } = req.body;

        // Check if game exists before updating
        const existingGame = await Game.findById(gameId);
        if (!existingGame) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // If categoryId is provided, check if category exists
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Invalid category' });
            }
        }

        // Build update object
        const gameData = {
            GameTitle: gameTitle,
            Platform: platform,
            Genre: genre,
            CategoryID: categoryId || null,
            PhysicalPrice: physicalPrice || 0,
            DigitalRentalPrice: digitalRentalPrice || 0
        };

        // Perform update
        const updated = await Game.update(gameId, gameData);
        if (!updated) {
            return res.status(400).json({ message: 'Failed to update game' });
        }

        // Fetch updated game to return in response
        const updatedGame = await Game.findById(gameId);
        res.json({ 
            message: 'Game updated successfully', 
            game: updatedGame 
        });
    } catch (error) {
        console.error('Update game error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Delete game (admin-only)
const deleteGame = async (req, res) => {
    try {
        // Extract gameId from URL
        const { gameId } = req.params;
        
        // Attempt deletion
        const deleted = await Game.delete(gameId);
        if (!deleted) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Return success message
        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        console.error('Delete game error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get available physical copies for a game
const getAvailablePhysicalCopies = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        // Query DB for available physical copies of given game
        const copies = await Game.getAvailablePhysicalCopies(gameId);
        res.json({ 
            message: 'Available physical copies retrieved successfully', 
            copies: copies 
        });
    } catch (error) {
        console.error('Get physical copies error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get available digital copies for a game
const getAvailableDigitalCopies = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        // Query DB for available digital copies of given game
        const copies = await Game.getAvailableDigitalCopies(gameId);
        res.json({ 
            message: 'Available digital copies retrieved successfully', 
            copies: copies 
        });
    } catch (error) {
        console.error('Get digital copies error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Validation middleware for creating a game
const validateCreateGame = [
    body('gameTitle').trim().isLength({ min: 1, max: 100 }).withMessage('Game title is required and must be less than 100 characters'),
    body('platform').optional().isLength({ max: 50 }).withMessage('Platform must be less than 50 characters'),
    body('genre').optional().isLength({ max: 50 }).withMessage('Genre must be less than 50 characters'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
    body('physicalPrice').optional().isFloat({ min: 0 }).withMessage('Physical price must be a non-negative number'),
    body('digitalRentalPrice').optional().isFloat({ min: 0 }).withMessage('Digital rental price must be a non-negative number')
];

// Validation middleware for updating a game
const validateUpdateGame = [
    body('gameTitle').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Game title must be less than 100 characters'),
    body('platform').optional().isLength({ max: 50 }).withMessage('Platform must be less than 50 characters'),
    body('genre').optional().isLength({ max: 50 }).withMessage('Genre must be less than 50 characters'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
    body('physicalPrice').optional().isFloat({ min: 0 }).withMessage('Physical price must be a non-negative number'),
    body('digitalRentalPrice').optional().isFloat({ min: 0 }).withMessage('Digital rental price must be a non-negative number')
];

// Export all controller functions and validation middleware
module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    getAvailablePhysicalCopies,
    getAvailableDigitalCopies,
    validateCreateGame,
    validateUpdateGame
};
