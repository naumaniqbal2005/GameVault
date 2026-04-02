// Import User model (handles DB operations for Users table)
const User = require('../models/User');
// Import validation helpers from express-validator
const { body, validationResult } = require('express-validator');

// Utility: generate a random UserID
// NOTE: In production you'd use auto-increment IDs or GUIDs instead
const generateUserId = () => Math.floor(Math.random() * 1000000) + 1;

// ---------------------- User Registration ----------------------

// Controller: Register a new user
const register = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullName, email } = req.body;

        // Check if user already exists by email
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Build user object
        const userData = {
            UserID: generateUserId(),
            FullName: fullName,
            Email: email,
            AccountStatus: 'Active'
        };

        // Insert into DB via model
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

// ---------------------- User Login ----------------------

// Controller: Login user (simplified)
// NOTE: In production, proper authentication (passwords, JWT) should be used
const login = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check account status
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

// ---------------------- User Profile ----------------------

// Controller: Get user profile by ID
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

// Controller: Update user profile
const updateProfile = async (req, res) => {
    try {
        // Validate input
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

        // If email is being changed, ensure it's not already taken
        if (email !== existingUser.Email) {
            const emailTaken = await User.findByEmail(email);
            if (emailTaken) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Build update object
        const userData = {
            FullName: fullName,
            Email: email,
            AccountStatus: accountStatus || existingUser.AccountStatus
        };

        // Perform update
        const updated = await User.update(userId, userData);
        if (!updated) {
            return res.status(400).json({ message: 'Failed to update user' });
        }

        // Fetch updated user to return
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

// ---------------------- Admin Functions ----------------------

// Controller: Get all users (admin-only)
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

// Controller: Delete a user (admin-only)
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

// ---------------------- Validation Middleware ----------------------

// Validation for registration
const validateRegister = [
    body('fullName').trim().isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

// Validation for login
const validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

// Validation for updating profile
const validateUpdate = [
    body('fullName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('accountStatus').optional().isIn(['Active', 'Inactive', 'Suspended']).withMessage('Invalid account status')
];

// Export all controller functions and validation middleware
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
