const Habit = require('../models/Habit');
const User = require('../models/User');

// @desc    Get all habits for logged in user
// @route   GET /api/habits
// @access  Private
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: habits.length, data: habits });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
exports.createHabit = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const habit = await Habit.create(req.body);
    res.status(201).json({ success: true, data: habit });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Toggle habit completion status
// @route   PUT /api/habits/:id/toggle
// @access  Private
exports.toggleHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
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
      // Reward user XP
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { xpPoints: 50, totalHabitsCompleted: 1 },
      });
    } else {
      habit.completedToday = false;
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
      habit.completedDates = habit.completedDates.filter((d) => d !== todayStr);
      // Deduct user XP
      await User.findByIdAndUpdate(req.user.id, {
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
// @access  Private
exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }

    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await habit.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
