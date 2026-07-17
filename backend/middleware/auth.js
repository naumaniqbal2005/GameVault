const { supabase } = require('../config/db');
const User = require('../models/User');

// Middleware to verify Supabase JWT token
const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    // Get user from our Users table using Supabase auth ID as UserID
    const dbUser = await User.findById(user.id);
    
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found in system.' });
    }

    req.user = {
      UserID: dbUser.UserID,
      Email: dbUser.Email,
      FullName: dbUser.FullName,
      isAdmin: dbUser.isAdmin || false,
      AccountStatus: dbUser.AccountStatus
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
