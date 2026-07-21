const Habit = require('../models/Habit');
const User = require('../models/User');

// Helper to resolve User ID (authenticated user or default demo user in MongoDB)
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

// @desc    Get all habits for user
// @route   GET /api/habits
exports.getHabits = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const habits = await Habit.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: habits.length, data: habits });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new habit (Saves to MongoDB)
// @route   POST /api/habits
exports.createHabit = async (req, res) => {
  try {
    const userId = await getUserId(req);
    req.body.user = userId;
    const habit = await Habit.create(req.body);
    console.log('🟢 Habit successfully created in MongoDB database:', habit.title);
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    console.error('🔴 Habit creation DB error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Toggle habit completion status
// @route   PUT /api/habits/:id/toggle
exports.toggleHabit = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isNowCompleted = !habit.completedToday;

    if (isNowCompleted) {
      habit.completedToday = true;
      habit.currentStreak += 1;
      if (habit.currentStreak > habit.bestStreak) {
        habit.bestStreak = habit.currentStreak;
      }
      if (!habit.completedDates.includes(todayStr)) {
        habit.completedDates.push(todayStr);
      }
      await User.findByIdAndUpdate(userId, {
        $inc: { xpPoints: 50, totalHabitsCompleted: 1 },
      });
    } else {
      habit.completedToday = false;
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
      habit.completedDates = habit.completedDates.filter((d) => d !== todayStr);
      await User.findByIdAndUpdate(userId, {
        $inc: { xpPoints: -50, totalHabitsCompleted: -1 },
      });
    }

    await habit.save();
    res.status(200).json({ success: true, data: habit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    await habit.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
