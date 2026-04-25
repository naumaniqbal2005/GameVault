// Import models for Purchases, Games, and Waitlists
const Purchase = require('../models/Purchase');
const Game = require('../models/Game');
const Waitlist = require('../models/Waitlist');
const Transaction = require('../models/Transaction');
// Import validation helpers from express-validator
const { body, validationResult } = require('express-validator');

// Utility: generate a random PurchaseID
// NOTE: In production you'd use auto-increment IDs or GUIDs instead
const generatePurchaseId = () => Math.floor(Math.random() * 1000000) + 1;

// Utility: generate a random TransactionID
const generateTransactionId = () => Math.floor(Math.random() * 1000000) + 1;

// ---------------------- Purchase Routes ----------------------

// Controller: Buy a physical copy of a game
const purchaseGame = async (req, res) => {
    try {
        // Validate input
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

        const game = copyInfo[0]; // Get game details for pricing

        // Debug: Log the game info to check what data we're getting
        console.log('Game info for purchase:', game);
        console.log('PhysicalPrice:', game.PhysicalPrice);

        // Build purchase object
        const purchaseData = {
            PurchaseID: generatePurchaseId(),
            UserID: userId,
            CopyID: copyId,
            AdminID: adminId,
            PurchaseDate: new Date()
        };

        // Insert into DB via model
        const newPurchase = await Purchase.create(purchaseData);

        // Create transaction record
        const transactionAmount = game.PhysicalPrice || 0;
        const transactionData = {
            TransactionID: generateTransactionId(),
            UserID: userId,
            RentalID: null,
            PurchaseID: newPurchase.PurchaseID,
            AdminID: adminId,
            Amount: transactionAmount,
            TransactionDate: new Date(),
            DiscountApplied: 0.00
        };

        console.log('Creating transaction with amount:', transactionAmount); // Debug log
        await Transaction.create(transactionData);

        res.status(201).json({ 
            message: 'Game purchased successfully', 
            purchase: newPurchase,
            price: game.PhysicalPrice // Include price in response
        });
    } catch (error) {
        console.error('Purchase game error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get purchase history for a specific user
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

// Controller: Get all purchases (admin-only)
const getAllPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.getAll();
        res.json(purchases);
    } catch (error) {
        console.error('Get all purchases error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get purchase details by ID
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

// ---------------------- Physical Waitlist Routes ----------------------

// Controller: Add user to physical waitlist for a game
const joinPhysicalWaitlist = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, gameId } = req.body;

        // Check if user is already on waitlist for this game
        const alreadyOnWaitlist = await Waitlist.isUserOnPhysicalWaitlist(userId, gameId);
        if (alreadyOnWaitlist) {
            return res.status(400).json({ message: 'You are already on the waitlist for this game' });
        }

        // Build waitlist object
        const waitlistData = {
            WaitlistID: generatePurchaseId(), // Reuse ID generator
            UserID: userId,
            GameID: gameId,
            RequestTime: new Date()
        };

        // Insert into DB via model
        await Waitlist.addToPhysicalWaitlist(waitlistData);
        res.status(201).json({ message: 'Added to physical waitlist successfully' });
    } catch (error) {
        console.error('Join physical waitlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get physical waitlist for a specific user
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

// Controller: Get physical waitlist for a specific game (admin-only)
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

// ---------------------- Validation Middleware ----------------------

// Validation for purchasing a game
const validatePurchaseGame = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('copyId').isInt({ min: 1 }).withMessage('Valid copy ID is required'),
    body('adminId').isInt({ min: 1 }).withMessage('Valid admin ID is required')
];

// Validation for joining physical waitlist
const validateJoinPhysicalWaitlist = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('gameId').isInt({ min: 1 }).withMessage('Valid game ID is required')
];

// Export all controller functions and validation middleware
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
