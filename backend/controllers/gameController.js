const Game = require('../models/Game');
const Category = require('../models/Category');
const { body, validationResult } = require('express-validator');

// Generate a simple game ID (in production, use proper ID generation)
const generateGameId = () => Math.floor(Math.random() * 1000000) + 1;

// Get all games with optional filters
const getAllGames = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            platform: req.query.platform,
            genre: req.query.genre,
            search: req.query.search
        };

        const games = await Game.getAll(filters);
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

// Get game by ID
const getGameById = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ 
            message: 'Game retrieved successfully', 
            game: game 
        });
    } catch (error) {
        console.error('Get game by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new game (admin function)
const createGame = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { gameTitle, platform, genre, categoryId, physicalPrice, digitalRentalPrice } = req.body;

        // Check if category exists
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Invalid category' });
            }
        }

        const gameData = {
            GameID: generateGameId(),
            GameTitle: gameTitle,
            Platform: platform,
            Genre: genre,
            CategoryID: categoryId || null,
            PhysicalPrice: physicalPrice || 0,
            DigitalRentalPrice: digitalRentalPrice || 0
        };

        const newGame = await Game.create(gameData);
        res.status(201).json({ 
            message: 'Game created successfully', 
            game: newGame 
        });
    } catch (error) {
        console.error('Create game error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update game (admin function)
const updateGame = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { gameId } = req.params;
        const { gameTitle, platform, genre, categoryId, physicalPrice, digitalRentalPrice } = req.body;

        // Check if game exists
        const existingGame = await Game.findById(gameId);
        if (!existingGame) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Check if category exists
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(400).json({ message: 'Invalid category' });
            }
        }

        const gameData = {
            GameTitle: gameTitle,
            Platform: platform,
            Genre: genre,
            CategoryID: categoryId || null,
            PhysicalPrice: physicalPrice || 0,
            DigitalRentalPrice: digitalRentalPrice || 0
        };

        const updated = await Game.update(gameId, gameData);
        if (!updated) {
            return res.status(400).json({ message: 'Failed to update game' });
        }

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

// Delete game (admin function)
const deleteGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const deleted = await Game.delete(gameId);
        if (!deleted) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        console.error('Delete game error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get available physical copies for a game
const getAvailablePhysicalCopies = async (req, res) => {
    try {
        const { gameId } = req.params;
        
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

// Get available digital copies for a game
const getAvailableDigitalCopies = async (req, res) => {
    try {
        const { gameId } = req.params;
        
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

// Validation middleware
const validateCreateGame = [
    body('gameTitle').trim().isLength({ min: 1, max: 100 }).withMessage('Game title is required and must be less than 100 characters'),
    body('platform').optional().isLength({ max: 50 }).withMessage('Platform must be less than 50 characters'),
    body('genre').optional().isLength({ max: 50 }).withMessage('Genre must be less than 50 characters'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
    body('physicalPrice').optional().isFloat({ min: 0 }).withMessage('Physical price must be a non-negative number'),
    body('digitalRentalPrice').optional().isFloat({ min: 0 }).withMessage('Digital rental price must be a non-negative number')
];

const validateUpdateGame = [
    body('gameTitle').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Game title must be less than 100 characters'),
    body('platform').optional().isLength({ max: 50 }).withMessage('Platform must be less than 50 characters'),
    body('genre').optional().isLength({ max: 50 }).withMessage('Genre must be less than 50 characters'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
    body('physicalPrice').optional().isFloat({ min: 0 }).withMessage('Physical price must be a non-negative number'),
    body('digitalRentalPrice').optional().isFloat({ min: 0 }).withMessage('Digital rental price must be a non-negative number')
];

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
