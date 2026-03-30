// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions and validation middleware
const {
    register,
    login,
    getProfile,
    updateProfile,
    getAllUsers,
    deleteUser,
    validateRegister,
    validateLogin,
    validateUpdate
} = require('../controllers/userController');

// ---------------------- Public Routes ----------------------
// These routes are accessible without authentication

// POST /users/register → Register a new user
router.post('/register', validateRegister, register);

// POST /users/login → Login user (simplified, no password/JWT in this demo)
router.post('/login', validateLogin, login);

// ---------------------- Protected Routes ----------------------
// In production, add authentication middleware before these routes
// Example: router.get('/profile/:userId', authMiddleware, getProfile);

// GET /users/profile/:userId → Get user profile by ID
router.get('/profile/:userId', getProfile);

// PUT /users/profile/:userId → Update user profile
router.put('/profile/:userId', validateUpdate, updateProfile);

// ---------------------- Admin Routes ----------------------
// In production, add admin authentication middleware before these routes
// Example: router.get('/', adminAuthMiddleware, getAllUsers);

// GET /users → Get all users (admin-only)
router.get('/', getAllUsers);

// DELETE /users/:userId → Delete a user (admin-only)
router.delete('/:userId', deleteUser);

// Export router so it can be mounted in server.js or app.js
module.exports = router;
