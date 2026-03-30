// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions and validation middleware
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    validateCreateCategory,
    validateUpdateCategory
} = require('../controllers/categoryController');

// ---------------------- Public Routes ----------------------
// These routes can be accessed without admin privileges

// GET /categories → Fetch all categories
router.get('/', getAllCategories);

// GET /categories/:categoryId → Fetch a single category by ID
router.get('/:categoryId', getCategoryById);

// ---------------------- Admin Routes ----------------------
// In production, add admin authentication middleware before these routes
// Example: router.post('/', adminAuthMiddleware, validateCreateCategory, createCategory);

// POST /categories → Create a new category
router.post('/', validateCreateCategory, createCategory);

// PUT /categories/:categoryId → Update an existing category
router.put('/:categoryId', validateUpdateCategory, updateCategory);

// DELETE /categories/:categoryId → Delete a category
router.delete('/:categoryId', deleteCategory);

// Export router so it can be mounted in server.js or app.js
module.exports = router;
