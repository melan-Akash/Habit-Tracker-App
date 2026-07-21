const { cloudinary } = require('../config/cloudinary');
const User = require('../models/User');

// @desc    Upload avatar image to Cloudinary
// @route   POST /api/upload/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an image file' });
    }

    // Convert memory buffer to base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'habit_tracker_avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill' }],
    });

    // Update user profile avatarUrl
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      url: uploadResponse.secure_url,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
