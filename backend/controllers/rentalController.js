// Import models for Rentals, Games, and Transactions
const Rental = require('../models/Rental');
const Game = require('../models/Game');
const Transaction = require('../models/Transaction');
// Import validation helpers from express-validator
const { body, validationResult } = require('express-validator');

// Utility: generate a random RentalID
// NOTE: In production you'd use auto-increment IDs or GUIDs instead
const generateRentalId = () => Math.floor(Math.random() * 1000000) + 1;

// Utility: generate a random TransactionID
const generateTransactionId = () => Math.floor(Math.random() * 1000000) + 1;

// --------------- Rental Routes ------------------

// Controller: Rent a digital game
const rentGame = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, copyId, rentalDays } = req.body;
        
        // Check if digital copy exists and is available
        const copyInfo = await Game.getAvailableDigitalCopiesByCopyId(copyId);
        if (!copyInfo || copyInfo.length === 0) {
            return res.status(400).json({ message: 'Digital copy not available' });
        }

        const game = copyInfo[0];

        // Check if user already has an active rental for this game
        const activeRentals = await Rental.getActiveRentals(userId);
        const alreadyRented = activeRentals.find(rental => rental.GameTitle === game.GameTitle);
        if (alreadyRented) {
            return res.status(400).json({ message: 'You have already rented this game' });
        }

        // Use the specific copy requested
        const availableCopy = copyInfo[0];
        
        // Build rental object
        const dateIssued = new Date();
        const dateDue = new Date();
        dateDue.setDate(dateDue.getDate() + (rentalDays || 7)); // Default 7 days if not provided

        const rentalData = {
            RentalID: generateRentalId(),
            UserID: userId,
            CopyID: copyId,
            DateIssued: dateIssued,
            DateDue: dateDue
        };

        // Insert into DB via model
        const newRental = await Rental.create(rentalData);

        // Create transaction record
        const transactionData = {
            TransactionID: generateTransactionId(),
            UserID: userId,
            RentalID: newRental.RentalID,
            CopyID: null,
            AdminID: 1, // Default admin ID - in production, get from authenticated admin
            Amount: game.DigitalRentalPrice || 0,
            TransactionDate: new Date(),
            DiscountApplied: 0.00
        };

        await Transaction.create(transactionData);

        res.status(201).json({ 
            message: 'Game rented successfully', 
            rental: newRental,
            dueDate: dateDue
        });
    } catch (error) {
        console.error('Rent game error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Return a rented game
const returnGame = async (req, res) => {
    try {
        const { rentalId } = req.params;
        
        // Check if rental exists
        const rental = await Rental.findById(rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Prevent duplicate returns
        if (rental.DateReturned) {
            return res.status(400).json({ message: 'Game already returned' });
        }

        // Mark rental as returned
        const returned = await Rental.returnGame(rentalId);
        if (!returned) {
            return res.status(400).json({ message: 'Failed to return game' });
        }

        res.json({ message: 'Game returned successfully' });
    } catch (error) {
        console.error('Return game error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Retrieve rental history for a specific user
const getUserRentals = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const rentals = await Rental.findByUserId(userId);
        res.json(rentals);
    } catch (error) {
        console.error('Get user rentals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get active rentals for a specific user
const getActiveRentals = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const rentals = await Rental.getActiveRentals(userId);
        res.json(rentals);
    } catch (error) {
        console.error('Get active rentals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Delete rental (admin-only)
const deleteRental = async (req, res) => {
    try {
        const { rentalId } = req.params;
        
        // Check if rental exists
        const rental = await Rental.findById(rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        // Perform deletion
        const deleted = await Rental.delete(rentalId);
        if (!deleted) {
            return res.status(400).json({ message: 'Failed to delete rental' });
        }

        res.json({ message: 'Rental deleted successfully' });
    } catch (error) {
        console.error('Delete rental error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get all rentals (admin-only)
const getAllRentals = async (req, res) => {
    try {
        const rentals = await Rental.getAll();
        res.json(rentals);
    } catch (error) {
        console.error('Get all rentals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get overdue rentals (admin-only)
const getOverdueRentals = async (req, res) => {
    try {
        const rentals = await Rental.getOverdueRentals();
        res.json(rentals);
    } catch (error) {
        console.error('Get overdue rentals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ---------------------- Validation Middleware ----------------------

// Validation for renting a game
const validateRentGame = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('copyId').isInt({ min: 1 }).withMessage('Valid copy ID is required'),
    body('rentalDays').optional().isInt({ min: 1, max: 30 }).withMessage('Rental days must be between 1 and 30')
];

// Export all controller functions and validation middleware for use in routes
module.exports = {
    rentGame,
    returnGame,
    getUserRentals,
    getActiveRentals,
    deleteRental,
    getAllRentals,
    getOverdueRentals,
    validateRentGame
};
