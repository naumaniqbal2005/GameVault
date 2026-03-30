const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Generate a simple user ID (in production, use proper ID generation)
const generateUserId = () => Math.floor(Math.random() * 1000000) + 1;

// User registration
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullName, email } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const userData = {
            UserID: generateUserId(),
            FullName: fullName,
            Email: email,
            AccountStatus: 'Active'
        };

        const newUser = await User.create(userData);
        res.status(201).json({ 
            message: 'User registered successfully', 
            user: newUser 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// User login (simplified - in production, use proper authentication)
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.AccountStatus !== 'Active') {
            return res.status(401).json({ message: 'Account is not active' });
        }

        // In production, generate JWT token here
        res.json({ 
            message: 'Login successful', 
            user: {
                UserID: user.UserID,
                FullName: user.FullName,
                Email: user.Email,
                AccountStatus: user.AccountStatus
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ 
            message: 'User profile retrieved successfully', 
            user: user 
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId } = req.params;
        const { fullName, email, accountStatus } = req.body;

        // Check if user exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email !== existingUser.Email) {
            const emailTaken = await User.findByEmail(email);
            if (emailTaken) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const userData = {
            FullName: fullName,
            Email: email,
            AccountStatus: accountStatus || existingUser.AccountStatus
        };

        const updated = await User.update(userId, userData);
        if (!updated) {
            return res.status(400).json({ message: 'Failed to update user' });
        }

        const updatedUser = await User.findById(userId);
        res.json({ 
            message: 'Profile updated successfully', 
            user: updatedUser 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (admin function)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json({ 
            message: 'All users retrieved successfully', 
            users: users 
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete user (admin function)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const deleted = await User.delete(userId);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Validation middleware
const validateRegister = [
    body('fullName').trim().isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

const validateUpdate = [
    body('fullName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('accountStatus').optional().isIn(['Active', 'Inactive', 'Suspended']).withMessage('Invalid account status')
];

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getAllUsers,
    deleteUser,
    validateRegister,
    validateLogin,
    validateUpdate
};
