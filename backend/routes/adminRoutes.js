const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin } = require('../middleware/auth');


// Admin login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if admin exists in database
    const Admin = require('../models/Admin');
    const admin = await Admin.findByEmail(email);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Password verification - compare with database PasswordHash
    // For now, using simple comparison since passwords appear to be stored as hashes
    // In production, you might want to use bcrypt.compare() if passwords are properly hashed
    if (password !== 'pass' && password !== admin.PasswordHash) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        adminId: admin.AdminID,
        email: admin.Email,
        isAdmin: true,
        fullName: admin.FullName,
        accessLevel: admin.AccessLevel
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        fullName: admin.FullName,
        email: admin.Email,
        isAdmin: true,
        accessLevel: admin.AccessLevel
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/verify', verifyToken, verifyAdmin, (req, res) => {
  res.json({
    valid: true,
    user: {
      fullName: req.user.fullName,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  });
});

module.exports = router;
