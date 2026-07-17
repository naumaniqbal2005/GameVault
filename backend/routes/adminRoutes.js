// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions
const { login } = require('../controllers/userController');
const { body, validationResult } = require('express-validator');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { supabase } = require('../config/db');
const User = require('../models/User');

// Validation for admin login
const validateAdminLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// POST /admin/login → Admin login (uses Supabase Auth but checks isAdmin)
router.post('/login', validateAdminLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Login with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Find user in our Users table using Supabase auth ID as UserID
        const user = await User.findById(authData.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found in system' });
        }

        // Check if user is admin
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        // Check account status
        if (user.AccountStatus !== 'Active') {
            return res.status(401).json({ message: 'Account is not active' });
        }

        res.json({
            message: 'Admin login successful',
            user: {
                UserID: user.UserID,
                FullName: user.FullName,
                Email: user.Email,
                AccountStatus: user.AccountStatus,
                isAdmin: true
            },
            token: authData.session.access_token,
            refreshToken: authData.session.refresh_token
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
