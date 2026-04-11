// Import the Category model to handle database operations for the Categories table
const Category = require('../models/Category');
// Import validation helpers from express-validator
const { body, validationResult } = require('express-validator');

// Utility: generate a random CategoryID
// NOTE: In production you'd use auto-increment IDs or GUIDs instead
const generateCategoryId = () => Math.floor(Math.random() * 1000000) + 1;

// Controller: Get all categories
const getAllCategories = async (req, res) => {
    try {
        // Call model method to fetch all categories from DB
        const categories = await Category.getAll();
        // Return JSON response with categories
        res.json({ 
            message: 'Categories retrieved successfully', 
            categories: categories 
        });
    } catch (error) {
        // Log error for debugging
        console.error('Get all categories error:', error);
        // Send generic server error response
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Get category by ID
const getCategoryById = async (req, res) => {
    try {
        // Extract categoryId from URL params
        const { categoryId } = req.params;
        
     // Query the database to retrieve a category by its ID
        const category = await Category.findById(categoryId);
        if (!category) {
            // If not found, return 404
            return res.status(404).json({ message: 'Category not found' });
        }

        // Return category if found
        res.json({ 
            message: 'Category retrieved successfully', 
            category: category 
        });
    } catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Controller: Create a new category (Admin only)
const createCategory = async (req, res) => {
    try {
        // Run validation checks
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If validation fails, return 400 with error details
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract categoryName from request body
        const { categoryName } = req.body;

        // Build category object with generated ID
        const categoryData = {
            CategoryID: generateCategoryId(),
            CategoryName: categoryName
        };

        // Insert into DB via model
        const newCategory = await Category.create(categoryData);
        // Return success response with created category
        res.status(201).json({ 
            message: 'Category created successfully', 
            category: newCategory 
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller: Update an existing category 
const updateCategory = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Extract categoryId from URL parameters and the new name from the request body
        const { categoryId } = req.params;
        const { categoryName } = req.body;

        // Check if category exists before updating
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Build update object
        const categoryData = {
            CategoryName: categoryName
        };

        // Perform update
        const updated = await Category.update(categoryId, categoryData);
        if (!updated) {
            return res.status(400).json({ message: 'Failed to update category' });
        }

        // Retrieve the updated category from the database to include in the response
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

// Controller: Delete category (admin-only)
const deleteCategory = async (req, res) => {
    try {
        // Extract categoryId from URL
        const { categoryId } = req.params;
        
        // Attempt deletion
        const deleted = await Category.delete(categoryId);
        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Return success message
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Validation middleware for create
const validateCreateCategory = [
    body('categoryName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category name is required and must be less than 50 characters')
];

// Validation middleware for update
const validateUpdateCategory = [
    body('categoryName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category name must be less than 50 characters')
];

// Export all controller functions and validation middleware
module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    validateCreateCategory,
    validateUpdateCategory
};
