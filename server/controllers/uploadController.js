const { cloudinary } = require('../config/cloudinary');
const User = require('../models/User');

// Helper to resolve User ID
const getUserId = async (req) => {
  if (req.user && (req.user.id || req.user._id)) {
    return req.user.id || req.user._id;
  }
  let defaultUser = await User.findOne({ email: 'akash@example.com' });
  if (!defaultUser) {
    defaultUser = await User.create({
      name: 'Akash Melan',
      email: 'akash@example.com',
      password: 'password123',
    });
  }
  return defaultUser._id;
};

// @desc    Upload avatar image to Cloudinary
// @route   POST /api/upload/avatar
// @access  Public / Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an image file' });
    }

    const userId = await getUserId(req);

    // Convert memory buffer to base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'habit_tracker_avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill' }],
    });

    // Update user profile avatarUrl in MongoDB
    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl: uploadResponse.secure_url },
      { new: true }
    );

    console.log('🟢 Cloudinary avatar uploaded successfully:', uploadResponse.secure_url);

    res.status(200).json({
      success: true,
      url: uploadResponse.secure_url,
      user,
    });
  } catch (error) {
    console.error('🔴 Cloudinary Upload Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
