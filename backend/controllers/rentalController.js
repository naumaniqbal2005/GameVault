const Rental = require('../models/Rental');
const Game = require('../models/Game');
const Waitlist = require('../models/Waitlist');
const { body, validationResult } = require('express-validator');

// Generate a simple rental ID (in production, use proper ID generation)
const generateRentalId = () => Math.floor(Math.random() * 1000000) + 1;

// Rent a digital game
const rentGame = async (req, res) => {
    try {
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

        // Check if user has already rented this game and hasn't returned it
        const activeRentals = await Rental.getActiveRentals(userId);
        const alreadyRented = activeRentals.find(rental => rental.GameTitle === game.GameTitle);
        if (alreadyRented) {
            return res.status(400).json({ message: 'You have already rented this game' });
        }

        // Use the specific copy that was requested
        const availableCopy = copyInfo[0];
        
        // Create rental
        const dateIssued = new Date();
        const dateDue = new Date();
        dateDue.setDate(dateDue.getDate() + (rentalDays || 7)); // Default 7 days

        const rentalData = {
            RentalID: generateRentalId(),
            UserID: userId,
            CopyID: copyId,
            DateIssued: dateIssued,
            DateDue: dateDue
        };

        const newRental = await Rental.create(rentalData);
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

// Return a rented game
const returnGame = async (req, res) => {
    try {
        const { rentalId } = req.params;
        
        // Check if rental exists and is active
        const rental = await Rental.findById(rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        if (rental.DateReturned) {
            return res.status(400).json({ message: 'Game already returned' });
        }

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

// Get user's rental history
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

// Get user's active rentals
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

// Delete rental (admin function)
const deleteRental = async (req, res) => {
    try {
        const { rentalId } = req.params;
        
        // Check if rental exists
        const rental = await Rental.findById(rentalId);
        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

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

// Get all rentals (admin function)
const getAllRentals = async (req, res) => {
    try {
        const rentals = await Rental.getAll();
        res.json(rentals);
    } catch (error) {
        console.error('Get all rentals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get overdue rentals (admin function)
const getOverdueRentals = async (req, res) => {
    try {
        const rentals = await Rental.getOverdueRentals();
        res.json(rentals);
    } catch (error) {
        console.error('Get overdue rentals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add user to digital waitlist
const joinDigitalWaitlist = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, gameId } = req.body;

        // Check if user is already on waitlist
        const alreadyOnWaitlist = await Waitlist.isUserOnDigitalWaitlist(userId, gameId);
        if (alreadyOnWaitlist) {
            return res.status(400).json({ message: 'You are already on the waitlist for this game' });
        }

        const waitlistData = {
            WaitlistID: generateRentalId(),
            UserID: userId,
            GameID: gameId,
            RequestTime: new Date()
        };

        await Waitlist.addToDigitalWaitlist(waitlistData);
        res.status(201).json({ message: 'Added to digital waitlist successfully' });
    } catch (error) {
        console.error('Join waitlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's waitlist
const getUserWaitlist = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const waitlist = await Waitlist.getUserDigitalWaitlist(userId);
        res.json(waitlist);
    } catch (error) {
        console.error('Get user waitlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get game's waitlist (admin function)
const getGameWaitlist = async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const waitlist = await Waitlist.getDigitalWaitlist(gameId);
        res.json(waitlist);
    } catch (error) {
        console.error('Get game waitlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Validation middleware
const validateRentGame = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('copyId').isInt({ min: 1 }).withMessage('Valid copy ID is required'),
    body('rentalDays').optional().isInt({ min: 1, max: 30 }).withMessage('Rental days must be between 1 and 30')
];

const validateJoinWaitlist = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('gameId').isInt({ min: 1 }).withMessage('Valid game ID is required')
];

module.exports = {
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
};
