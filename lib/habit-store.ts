import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Habit, AchievementBadge, UserProfile } from '../types/database.type';

interface HabitContextType {
  habits: Habit[];
  badges: AchievementBadge[];
  user: UserProfile;
  toggleHabit: (id: string) => void;
  addHabit: (newHabit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  deleteHabit: (id: string) => void;
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
}

const initialHabits: Habit[] = [
  {
    id: '1',
    title: 'Morning Meditation',
    description: '10 minutes of mindfulness to start the day calm',
    category: 'mind',
    frequency: 'daily',
    targetCount: 10,
    unit: 'mins',
    color: '#8C7CFF',
    icon: 'meditation',
    currentStreak: 7,
    bestStreak: 15,
    completedToday: true,
    completedDates: ['2026-07-21', '2026-07-20', '2026-07-19'],
    createdAt: '2026-07-01',
    timeOfDay: 'morning',
  },
  {
    id: '2',
    title: 'Drink 2.5L Water',
    description: 'Stay hydrated for energy and focus',
    category: 'health',
    frequency: 'daily',
    targetCount: 2.5,
    unit: 'liters',
    color: '#00E676',
    icon: 'water-outline',
    currentStreak: 14,
    bestStreak: 21,
    completedToday: true,
    completedDates: ['2026-07-21', '2026-07-20'],
    createdAt: '2026-06-15',
    timeOfDay: 'anytime',
  },
  {
    id: '3',
    title: 'Read 15 Pages',
    description: 'Expand your knowledge with books',
    category: 'learning',
    frequency: 'daily',
    targetCount: 15,
    unit: 'pages',
    color: '#FFB74D',
    icon: 'book-open-variant',
    currentStreak: 5,
    bestStreak: 12,
    completedToday: false,
    completedDates: ['2026-07-20'],
    createdAt: '2026-07-10',
    timeOfDay: 'evening',
  },
  {
    id: '4',
    title: '30 Min Gym Workout',
    description: 'Strength training & cardio for total fitness',
    category: 'fitness',
    frequency: 'daily',
    targetCount: 30,
    unit: 'mins',
    color: '#FF5252',
    icon: 'dumbbell',
    currentStreak: 12,
    bestStreak: 18,
    completedToday: true,
    completedDates: ['2026-07-21'],
    createdAt: '2026-06-20',
    timeOfDay: 'morning',
  },
  {
    id: '5',
    title: 'Daily Code Practice',
    description: 'Build projects & solve algorithm challenges',
    category: 'work',
    frequency: 'daily',
    targetCount: 1,
    unit: 'hours',
    color: '#6C5CE7',
    icon: 'code-tags',
    currentStreak: 9,
    bestStreak: 14,
    completedToday: false,
    completedDates: ['2026-07-20'],
    createdAt: '2026-07-05',
    timeOfDay: 'afternoon',
  },
  {
    id: '6',
    title: 'Night Journaling',
    description: 'Reflect on today\'s wins & gratitude',
    category: 'creativity',
    frequency: 'daily',
    targetCount: 1,
    unit: 'entry',
    color: '#FF6584',
    icon: 'notebook',
    currentStreak: 4,
    bestStreak: 7,
    completedToday: true,
    completedDates: ['2026-07-21'],
    createdAt: '2026-07-12',
    timeOfDay: 'evening',
  },
];

const initialBadges: AchievementBadge[] = [
  {
    id: 'b1',
    title: 'Streak Novice',
    description: 'Maintain any habit for 3 days in a row',
    icon: 'lightning-bolt',
    unlocked: true,
    unlockedAt: '2026-07-04',
    progress: 100,
    color: '#FFD700',
  },
  {
    id: 'b2',
    title: 'Hydration Hero',
    description: 'Complete 10 water drinking goals',
    icon: 'water',
    unlocked: true,
    unlockedAt: '2026-07-15',
    progress: 100,
    color: '#00E676',
  },
  {
    id: 'b3',
    title: '7-Day Warrior',
    description: 'Reach a 7-day streak on 3 different habits',
    icon: 'fire',
    unlocked: true,
    unlockedAt: '2026-07-18',
    progress: 100,
    color: '#FF6584',
  },
  {
    id: 'b4',
    title: 'Habit Master',
    description: 'Complete 50 total habit check-ins',
    icon: 'trophy-award',
    unlocked: false,
    progress: 75,
    color: '#8C7CFF',
  },
  {
    id: 'b5',
    title: 'Mindful Legend',
    description: 'Log 30 meditation sessions',
    icon: 'yoga',
    unlocked: false,
    progress: 40,
    color: '#FFB74D',
  },
];

const initialUser: UserProfile = {
  id: 'u1',
  name: 'Akash Melan',
  email: 'akash@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  totalHabitsCompleted: 48,
  currentLevel: 5,
  xpPoints: 1250,
  joinedDate: 'June 2026',
  isDarkMode: true,
};

const HabitContext = createContext<HabitContextType>({
  habits: [],
  badges: [],
  user: initialUser,
  toggleHabit: () => {},
  addHabit: () => {},
  deleteHabit: () => {},
  filterCategory: 'all',
  setFilterCategory: () => {},
});

export const HabitProvider = ({ children }: { children: ReactNode }) => {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [badges, setBadges] = useState<AchievementBadge[]>(initialBadges);
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          const isNowCompleted = !habit.completedToday;
          const newStreak = isNowCompleted
            ? habit.currentStreak + 1
            : Math.max(0, habit.currentStreak - 1);
          const newBest = Math.max(habit.bestStreak, newStreak);

          // Update XP
          setUser((u) => ({
            ...u,
            totalHabitsCompleted: isNowCompleted
              ? u.totalHabitsCompleted + 1
              : Math.max(0, u.totalHabitsCompleted - 1),
            xpPoints: isNowCompleted ? u.xpPoints + 50 : Math.max(0, u.xpPoints - 50),
          }));

          return {
            ...habit,
            completedToday: isNowCompleted,
            currentStreak: newStreak,
            bestStreak: newBest,
          };
        }
        return habit;
      })
    );
  };

  const addHabit = (newHabitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      completedDates: [],
    };
    setHabits((prev) => [newHabit, ...prev]);
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        badges,
        user,
        toggleHabit,
        addHabit,
        deleteHabit,
        filterCategory,
        setFilterCategory,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
