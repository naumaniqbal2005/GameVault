const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    validateCreateCategory,
    validateUpdateCategory
} = require('../controllers/categoryController');

// Public routes
router.get('/', getAllCategories);
router.get('/:categoryId', getCategoryById);

// Admin routes (add admin authentication middleware in production)
router.post('/', validateCreateCategory, createCategory);
router.put('/:categoryId', validateUpdateCategory, updateCategory);
router.delete('/:categoryId', deleteCategory);

module.exports = router;
