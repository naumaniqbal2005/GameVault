const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/membershipController');

// Membership tier routes
router.get('/tiers', getAllTiers);
router.get('/tiers/:tierId', getTierById);
router.post('/tiers', validateCreateTier, createTier);

// User membership routes
router.get('/user/:userId', getUserMembership);
router.get('/user/:userId/history', getUserMembershipHistory);
router.post('/user', validateCreateUserMembership, createUserMembership);
router.put('/:membershipId/status', validateUpdateStatus, updateMembershipStatus);

// Admin routes
router.get('/', getAllUserMemberships);

module.exports = router;
