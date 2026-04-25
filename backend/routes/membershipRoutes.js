// Import Express and create a router instance
const express = require('express');
const router = express.Router();

// Import controller functions and validation middleware
const {
    getAllTiers,
    getTierById,
    createTier,
    getUserMembership,
    getUserMembershipHistory,
    createUserMembership,
    updateMembershipStatus,
    getAllUserMemberships,
    deleteMembership,
    validateCreateTier,
    validateCreateUserMembership,
    validateUpdateStatus
} = require('../controllers/membershipController');

// ---------------------- Membership Tier Routes ----------------------
// These routes manage membership tiers (admin functionality)

// GET /membership/tiers → Fetch all membership tiers
router.get('/tiers', getAllTiers);

// GET /membership/tiers/:tierId → Fetch a single membership tier by ID
router.get('/tiers/:tierId', getTierById);

// POST /membership/tiers → Create a new membership tier
router.post('/tiers', validateCreateTier, createTier);

// ---------------------- User Membership Routes ----------------------
// These routes manage memberships assigned to users

// GET /membership/user/:userId → Fetch current membership for a user
router.get('/user/:userId', getUserMembership);

// GET /membership/user/:userId/history → Fetch full membership history for a user
router.get('/user/:userId/history', getUserMembershipHistory);

// POST /membership/user → Create a new membership for a user
router.post('/user', validateCreateUserMembership, createUserMembership);

// PUT /membership/:membershipId/status → Update membership status (Active, Expired, Cancelled)
router.put('/:membershipId/status', validateUpdateStatus, updateMembershipStatus);

// ---------------------- Admin Routes ----------------------
// Admin-only route to fetch all user memberships

// GET /membership → Fetch all user memberships
router.get('/', getAllUserMemberships);

// DELETE /membership/:membershipId → Delete a membership (admin-only)
router.delete('/:membershipId', deleteMembership);

// Export router so it can be mounted in server.js or app.js
module.exports = router;
