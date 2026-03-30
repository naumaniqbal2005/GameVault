const Category = require('../models/Category');
const { body, validationResult } = require('express-validator');

// Generate a simple category ID (in production, use proper ID generation)
const generateCategoryId = () => Math.floor(Math.random() * 1000000) + 1;

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json({ 
            message: 'Categories retrieved successfully', 
            categories: categories 
        });
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ 
            message: 'Category retrieved successfully', 
            category: category 
        });
    } catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new category (admin function)
const createCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { categoryName } = req.body;

        const categoryData = {
            CategoryID: generateCategoryId(),
            CategoryName: categoryName
        };

        const newCategory = await Category.create(categoryData);
        res.status(201).json({ 
            message: 'Category created successfully', 
            category: newCategory 
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update category (admin function)
const updateCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { categoryId } = req.params;
        const { categoryName } = req.body;

        // Check if category exists
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const categoryData = {
            CategoryName: categoryName
        };

        const updated = await Category.update(categoryId, categoryData);
        if (!updated) {
            return res.status(400).json({ message: 'Failed to update category' });
        }

        const updatedCategory = await Category.findById(categoryId);
        res.json({ 
            message: 'Category updated successfully', 
            category: updatedCategory 
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete category (admin function)
const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const deleted = await Category.delete(categoryId);
        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Validation middleware
const validateCreateCategory = [
    body('categoryName').trim().isLength({ min: 1, max: 50 }).withMessage('Category name is required and must be less than 50 characters')
];

const validateUpdateCategory = [
    body('categoryName').trim().isLength({ min: 1, max: 50 }).withMessage('Category name must be less than 50 characters')
];

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    validateCreateCategory,
    validateUpdateCategory
};
