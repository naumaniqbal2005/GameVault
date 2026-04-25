const express = require('express');
const router = express.Router();
const PhysicalCopy = require('../models/PhysicalCopies');
const { body, validationResult } = require('express-validator');

// POST /physical-copies → Create a new physical copy
router.post('/', [
    body('gameId').isInt({ min: 1 }).withMessage('Game ID must be a positive integer'),
    body('copyCondition').isIn(['New', 'Good', 'Fair', 'Poor']).withMessage('Copy condition must be New, Good, Fair, or Poor'),
    body('availability').isIn(['Available', 'Rented', 'Maintenance']).withMessage('Availability must be Available, Rented, or Maintenance')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { gameId, copyCondition, availability } = req.body;
        
        const copyData = {
            GameID: gameId,
            CopyCondition: copyCondition,
            Availability: availability
        };

        const newCopy = await PhysicalCopy.create(copyData);
        res.status(201).json({ 
            message: 'Physical copy created successfully', 
            copy: newCopy 
        });
    } catch (error) {
        console.error('Create physical copy error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /physical-copies/game/:gameId → Get all physical copies for a game
router.get('/game/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const copies = await PhysicalCopy.findByGameId(gameId);
        res.json({ 
            message: 'Physical copies retrieved successfully', 
            copies: copies 
        });
    } catch (error) {
        console.error('Get physical copies error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
