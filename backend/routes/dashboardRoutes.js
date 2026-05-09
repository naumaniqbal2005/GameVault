const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const { getDashboardStats } = require('../controllers/dashboardController');

router.get('/stats', verifyToken, verifyAdmin, getDashboardStats);

module.exports = router;
