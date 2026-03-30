const express = require('express');
const router = express.Router();
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

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes (add authentication middleware in production)
router.get('/profile/:userId', getProfile);
router.put('/profile/:userId', validateUpdate, updateProfile);

// Admin routes (add admin authentication middleware in production)
router.get('/', getAllUsers);
router.delete('/:userId', deleteUser);

module.exports = router;
