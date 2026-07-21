export type HabitCategory = 'fitness' | 'mind' | 'health' | 'learning' | 'work' | 'creativity';

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetCount: number;
  unit: string;
  color: string;
  icon: string;
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  completedDates: string[];
  createdAt: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  reminderTime?: string; // e.g. "08:00", "20:30"
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  totalHabitsCompleted: number;
  currentLevel: number;
  xpPoints: number;
  joinedDate: string;
  isDarkMode: boolean;
}
