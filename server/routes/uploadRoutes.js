const express = require('express');
const { uploadAvatar } = require('../controllers/uploadController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.post('/avatar', optionalAuth, upload.single('image'), uploadAvatar);

module.exports = router;
