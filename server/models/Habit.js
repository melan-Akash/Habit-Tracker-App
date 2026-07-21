const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Habit title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['fitness', 'mind', 'health', 'learning', 'work', 'creativity'],
      default: 'fitness',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    targetCount: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      default: 'times',
    },
    color: {
      type: String,
      default: '#8C7CFF',
    },
    icon: {
      type: String,
      default: 'check',
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    completedToday: {
      type: Boolean,
      default: false,
    },
    completedDates: [
      {
        type: String, // YYYY-MM-DD
      },
    ],
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime',
    },
    reminderTime: {
      type: String,
      default: '08:00',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Habit', habitSchema);
