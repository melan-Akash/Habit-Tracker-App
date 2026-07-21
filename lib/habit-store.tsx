import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Habit, AchievementBadge, UserProfile } from '../types/database.type';
import {
  requestNotificationPermissions,
  sendCheckInNotification,
  scheduleDailyReminders,
  scheduleHabitReminder,
} from './notification-service';
import { habitAPI } from './api';

interface HabitContextType {
  habits: Habit[];
  badges: AchievementBadge[];
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  toggleHabit: (id: string) => void;
  addHabit: (newHabit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  deleteHabit: (id: string) => void;
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  refreshHabits: () => Promise<void>;
  loadingHabits: boolean;
}

const initialBadges: AchievementBadge[] = [
  {
    id: 'b1',
    title: 'Streak Novice',
    description: 'Maintain any habit for 3 days in a row',
    icon: 'lightning-bolt',
    unlocked: false,
    progress: 0,
    color: '#FFD700',
  },
  {
    id: 'b2',
    title: 'Hydration Hero',
    description: 'Complete 10 water drinking goals',
    icon: 'water',
    unlocked: false,
    progress: 0,
    color: '#00E676',
  },
  {
    id: 'b3',
    title: '7-Day Warrior',
    description: 'Reach a 7-day streak on 3 different habits',
    icon: 'fire',
    unlocked: false,
    progress: 0,
    color: '#FF6584',
  },
  {
    id: 'b4',
    title: 'Habit Master',
    description: 'Complete 50 total habit check-ins',
    icon: 'trophy-award',
    unlocked: false,
    progress: 0,
    color: '#8C7CFF',
  },
];

const defaultUser: UserProfile = {
  id: '',
  name: 'Akash Melan',
  email: 'akash@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  totalHabitsCompleted: 0,
  currentLevel: 1,
  xpPoints: 0,
  joinedDate: 'Today',
  isDarkMode: true,
};

const HabitContext = createContext<HabitContextType>({
  habits: [],
  badges: [],
  user: defaultUser,
  setUser: () => {},
  toggleHabit: () => {},
  addHabit: () => {},
  deleteHabit: () => {},
  filterCategory: 'all',
  setFilterCategory: () => {},
  refreshHabits: async () => {},
  loadingHabits: false,
});

export const HabitProvider = ({ children }: { children: ReactNode }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [badges, setBadges] = useState<AchievementBadge[]>(initialBadges);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loadingHabits, setLoadingHabits] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const granted = await requestNotificationPermissions();
      if (granted) {
        scheduleDailyReminders(true, true);
      }
      refreshHabits();
    })();
  }, []);

  const refreshHabits = async () => {
    setLoadingHabits(true);
    try {
      const res = await habitAPI.getHabits();
      if (res.data && Array.isArray(res.data)) {
        const formatted = res.data.map((h: any) => ({
          ...h,
          id: h.id || h._id || Date.now().toString(),
        }));
        setHabits(formatted);
      }
    } catch (e: any) {
      console.log('Backend not connected or offline, using local state:', e.message);
    } finally {
      setLoadingHabits(false);
    }
  };

  const toggleHabit = async (id: string) => {
    // Optimistic UI update
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id || (habit as any)._id === id) {
          const isNowCompleted = !habit.completedToday;
          const newStreak = isNowCompleted
            ? habit.currentStreak + 1
            : Math.max(0, habit.currentStreak - 1);
          const newBest = Math.max(habit.bestStreak, newStreak);

          if (isNowCompleted) {
            sendCheckInNotification(habit.title, newStreak);
          }

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

    try {
      await habitAPI.toggleHabit(id);
    } catch (e: any) {
      console.log('Backend toggle synced locally');
    }
  };

  const addHabit = async (newHabitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    const tempId = Date.now().toString();
    const newHabit: Habit = {
      ...newHabitData,
      id: tempId,
      createdAt: new Date().toISOString().split('T')[0],
      completedDates: [],
    };

    setHabits((prev) => [newHabit, ...prev]);

    if (newHabitData.reminderTime) {
      const parts = newHabitData.reminderTime.split(':');
      if (parts.length === 2) {
        const hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);
        if (!isNaN(hour) && !isNaN(minute)) {
          scheduleHabitReminder(newHabitData.title, hour, minute);
        }
      }
    }

    try {
      const res = await habitAPI.createHabit(newHabitData);
      if (res.data) {
        const mongoId = res.data._id || res.data.id || tempId;
        setHabits((prev) =>
          prev.map((h) => (h.id === tempId ? { ...res.data, id: mongoId } : h))
        );
      }
    } catch (e: any) {
      console.log('Backend create synced locally');
    }
  };

  const deleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id && (h as any)._id !== id));

    try {
      await habitAPI.deleteHabit(id);
    } catch (e: any) {
      console.log('Backend delete synced locally');
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        badges,
        user,
        setUser,
        toggleHabit,
        addHabit,
        deleteHabit,
        filterCategory,
        setFilterCategory,
        refreshHabits,
        loadingHabits,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
