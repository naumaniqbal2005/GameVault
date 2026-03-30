const { MembershipTier, UserMembership } = require('../models/Membership');
const { body, validationResult } = require('express-validator');

// Generate simple IDs (in production, use proper ID generation)
const generateTierId = () => Math.floor(Math.random() * 1000000) + 1;
const generateMembershipId = () => Math.floor(Math.random() * 1000000) + 1;

// Membership Tier routes
const getAllTiers = async (req, res) => {
    try {
        const tiers = await MembershipTier.getAll();
        res.json(tiers);
    } catch (error) {
        console.error('Get all tiers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTierById = async (req, res) => {
    try {
        const { tierId } = req.params;
        
        const tier = await MembershipTier.findById(tierId);
        if (!tier) {
            return res.status(404).json({ message: 'Membership tier not found' });
        }

        res.json(tier);
    } catch (error) {
        console.error('Get tier by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createTier = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { tierName, discountPercent, description } = req.body;

        const tierData = {
            TierID: generateTierId(),
            TierName: tierName,
            DiscountPercent: discountPercent,
            Description: description
        };

        const newTier = await MembershipTier.create(tierData);
        res.status(201).json({ 
            message: 'Membership tier created successfully', 
            tier: newTier 
        });
    } catch (error) {
        console.error('Create tier error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// User Membership routes
const getUserMembership = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const membership = await UserMembership.findByUserId(userId);
        if (!membership) {
            return res.json({ message: 'No active membership found' });
        }

        res.json(membership);
    } catch (error) {
        console.error('Get user membership error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserMembershipHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const history = await UserMembership.getUserMembershipHistory(userId);
        res.json(history);
    } catch (error) {
        console.error('Get membership history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createUserMembership = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, tierId, startDate, endDate } = req.body;

        // Check if tier exists
        const tier = await MembershipTier.findById(tierId);
        if (!tier) {
            return res.status(400).json({ message: 'Invalid membership tier' });
        }

        const membershipData = {
            MembershipID: generateMembershipId(),
            UserID: userId,
            TierID: tierId,
            StartDate: startDate,
            EndDate: endDate,
            Status: 'Active'
        };

        const newMembership = await UserMembership.create(membershipData);
        res.status(201).json({ 
            message: 'User membership created successfully', 
            membership: newMembership 
        });
    } catch (error) {
        console.error('Create user membership error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateMembershipStatus = async (req, res) => {
    try {
        const { membershipId } = req.params;
        const { status } = req.body;

        const updated = await UserMembership.updateStatus(membershipId, status);
        if (!updated) {
            return res.status(404).json({ message: 'Membership not found' });
        }

        res.json({ message: 'Membership status updated successfully' });
    } catch (error) {
        console.error('Update membership status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllUserMemberships = async (req, res) => {
    try {
        const memberships = await UserMembership.getAll();
        res.json(memberships);
    } catch (error) {
        console.error('Get all user memberships error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Validation middleware
const validateCreateTier = [
    body('tierName').trim().isLength({ min: 1, max: 30 }).withMessage('Tier name is required and must be less than 30 characters'),
    body('discountPercent').isFloat({ min: 0, max: 100 }).withMessage('Discount percent must be between 0 and 100'),
    body('description').optional().isLength({ max: 100 }).withMessage('Description must be less than 100 characters')
];

const validateCreateUserMembership = [
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    body('tierId').isInt({ min: 1 }).withMessage('Valid tier ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required')
];

const validateUpdateStatus = [
    body('status').isIn(['Active', 'Expired', 'Cancelled']).withMessage('Status must be Active, Expired, or Cancelled')
];

module.exports = {
    getAllTiers,
    getTierById,
    createTier,
    getUserMembership,
    getUserMembershipHistory,
    createUserMembership,
    updateMembershipStatus,
    getAllUserMemberships,
    validateCreateTier,
    validateCreateUserMembership,
    validateUpdateStatus
};
