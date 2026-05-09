const express = require('express');
const router = express.Router();
const DigitalCopy = require('../models/DigitalCopies');
const { body, validationResult } = require('express-validator');

// POST /digital-copies → Create a new digital copy
router.post('/', [
    body('gameId').isInt({ min: 1 }).withMessage('Game ID must be a positive integer'),
    body('availability').isIn(['Available', 'Rented', 'Maintenance']).withMessage('Availability must be Available, Rented, or Maintenance')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { gameId, availability } = req.body;
        
        const copyData = {
            GameID: gameId,
            Availability: availability
        };

        const newCopy = await DigitalCopy.create(copyData);
        res.status(201).json({ 
            message: 'Digital copy created successfully', 
            copy: newCopy 
        });
    } catch (error) {
        console.error('Create digital copy error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /digital-copies/game/:gameId → Get all digital copies for a game
router.get('/game/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const copies = await DigitalCopy.findByGameId(gameId);
        res.json({ 
            message: 'Digital copies retrieved successfully', 
            copies: copies 
        });
    } catch (error) {
        console.error('Get digital copies error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
