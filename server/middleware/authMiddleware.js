const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token verification failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
      req.user = await User.findById(decoded.id);
    } catch (err) {
      console.log('Optional auth token expired/invalid, continuing as guest');
    }
  }

  next();
};

module.exports = { protect, optionalAuth };
