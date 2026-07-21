const User = require('../models/User');

// Helper to get user ID
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

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        totalHabitsCompleted: user.totalHabitsCompleted,
        xpPoints: user.xpPoints,
        currentLevel: user.currentLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        totalHabitsCompleted: user.totalHabitsCompleted,
        xpPoints: user.xpPoints,
        currentLevel: user.currentLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const user = await User.findById(userId);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile details (Name, Email)
// @route   PUT /api/auth/profile
// @access  Public / Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        totalHabitsCompleted: updatedUser.totalHabitsCompleted,
        xpPoints: updatedUser.xpPoints,
        currentLevel: updatedUser.currentLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
