// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions
const { body, validationResult } = require('express-validator');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Validation for admin login
const validateAdminLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// POST /admin/login → Admin login (uses JWT and checks isAdmin)
router.post('/login', validateAdminLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await User.comparePassword(password, user.Password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        // Check account status
        if (user.AccountStatus !== 'Active') {
            return res.status(401).json({ message: 'Account is not active' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.UserID, email: user.Email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Admin login successful',
            user: {
                UserID: user.UserID,
                FullName: user.FullName,
                Email: user.Email,
                AccountStatus: user.AccountStatus,
                isAdmin: true
            },
            token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// GET /admin/verify → Verify admin token
router.get('/verify', verifyToken, verifyAdmin, (req, res) => {
    res.json({ valid: true, user: req.user });
});

module.exports = router;
