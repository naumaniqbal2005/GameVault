const Purchase = require('../models/Purchase');
const Game = require('../models/Game');
const Waitlist = require('../models/Waitlist');
const { body, validationResult } = require('express-validator');

// Generate a simple purchase ID (in production, use proper ID generation)
const generatePurchaseId = () => Math.floor(Math.random() * 1000000) + 1;

// Buy a physical copy
const purchaseGame = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, copyId, adminId } = req.body;
        
        // Check if physical copy exists and is available
        const copyInfo = await Game.getAvailablePhysicalCopiesByCopyId(copyId);
        if (!copyInfo || copyInfo.length === 0) {
            return res.status(400).json({ message: 'Physical copy not available' });
        }

        const game = copyInfo[0];

        // Create purchase
        const purchaseData = {
            PurchaseID: generatePurchaseId(),
            UserID: userId,
            CopyID: copyId,
            AdminID: adminId,
            PurchaseDate: new Date()
        };

        const newPurchase = await Purchase.create(purchaseData);
        res.status(201).json({ 
            message: 'Game purchased successfully', 
            purchase: newPurchase,
            price: game.PhysicalPrice
        });
    } catch (error) {
        console.error('Purchase game error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's purchase history
const getUserPurchases = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const purchases = await Purchase.findByUserId(userId);
        res.json(purchases);
    } catch (error) {
        console.error('Get user purchases error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all purchases (admin function)
const getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.getAll();
        res.json(purchases);
    } catch (error) {
        console.error('Get all purchases error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get purchase by ID
const getPurchaseById = async (req, res) => {
    try {
        const { purchaseId } = req.params;
        
        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }

        res.json(purchase);
    } catch (error) {
        console.error('Get purchase by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add user to physical waitlist
const joinPhysicalWaitlist = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, gameId } = req.body;

        // Check if user is already on waitlist
        const alreadyOnWaitlist = await Waitlist.isUserOnPhysicalWaitlist(userId, gameId);
        if (alreadyOnWaitlist) {
            return res.status(400).json({ message: 'You are already on the waitlist for this game' });
        }

        const waitlistData = {
            WaitlistID: generatePurchaseId(),
            UserID: userId,
            GameID: gameId,
            RequestTime: new Date()
        };

        await Waitlist.addToPhysicalWaitlist(waitlistData);
        res.status(201).json({ message: 'Added to physical waitlist successfully' });
    } catch (error) {
        console.error('Join physical waitlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's physical waitlist
const getUserPhysicalWaitlist = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const waitlist = await Waitlist.getUserPhysicalWaitlist(userId);
        res.json(waitlist);
    } catch (error) {
        console.error('Get user physical waitlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get game's physical waitlist (admin function)
const getGamePhysicalWaitlist = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const waitlist = await Waitlist.getPhysicalWaitlist(gameId);
        res.json(waitlist);
    } catch (error) {
        console.error('Get game physical waitlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Validation middleware
const validatePurchaseGame = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('copyId').isInt({ min: 1 }).withMessage('Valid copy ID is required'),
    body('adminId').isInt({ min: 1 }).withMessage('Valid admin ID is required')
];

const validateJoinPhysicalWaitlist = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('gameId').isInt({ min: 1 }).withMessage('Valid game ID is required')
];

module.exports = {
    purchaseGame,
    getUserPurchases,
    getAllPurchases,
    getPurchaseById,
    joinPhysicalWaitlist,
    getUserPhysicalWaitlist,
    getGamePhysicalWaitlist,
    validatePurchaseGame,
    validateJoinPhysicalWaitlist
};
