import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure foreground notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 1. Request Notification Permissions & Channel Setup for Android Physical Phones
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return true;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Notification permission not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Habit Reminders & Check-ins',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C4DFF',
        sound: 'default',
        enableVibrate: true,
      });
    }

    return true;
  } catch (error: any) {
    console.warn('⚠️ Notification setup error:', error.message);
    return false;
  }
};

// 2. Instant Check-in Celebration Notification
export const sendCheckInNotification = async (habitTitle: string, currentStreak: number) => {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit Completed! 🎉',
        body: `Awesome job! You kept your ${currentStreak}-day streak burning for "${habitTitle}"! 🔥`,
        data: { type: 'checkin', habitTitle },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
      trigger: null, // Send immediately
    });
  } catch (e: any) {
    console.warn('Instant notification error:', e.message);
  }
};

// 3. Daily Morning & Evening Scheduled Reminders
export const scheduleDailyReminders = async (morningEnabled: boolean = true, eveningEnabled: boolean = true) => {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Morning Reminder (8:00 AM)
    if (morningEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Good Morning! 🌅',
          body: 'Time to start your morning habits and build your streak momentum!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 8,
          minute: 0,
        },
      });
    }

    // Evening Reminder (8:00 PM)
    if (eveningEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Evening Habit Review 🌆',
          body: 'Check in your remaining habits before bedtime to keep your streaks alive!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });
    }
  } catch (e: any) {
    console.warn('Schedule reminders error:', e.message);
  }
};

// 4. Custom Habit Specific Reminder Scheduler
export const scheduleHabitReminder = async (title: string, hour: number, minute: number) => {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Reminder: ${title} ⏰`,
        body: `It's time for your habit "${title}". Let's get it done! 💪`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (e: any) {
    console.warn('Habit reminder error:', e.message);
  }
};
