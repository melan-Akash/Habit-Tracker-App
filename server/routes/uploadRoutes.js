const express = require('express');
const { uploadAvatar } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.post('/avatar', protect, upload.single('image'), uploadAvatar);

module.exports = router;
