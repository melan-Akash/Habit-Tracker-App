const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', optionalAuth, getMe);
router.put('/profile', optionalAuth, updateProfile);

module.exports = router;
