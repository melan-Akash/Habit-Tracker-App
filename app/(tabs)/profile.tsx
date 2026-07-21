import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../lib/theme-context';
import { useHabits } from '../../lib/habit-store';

export default function ProfileScreen() {
  const { isDark, colors, toggleTheme } = useAppTheme();
  const { user, habits } = useHabits();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const totalStreaks = habits.reduce((acc, curr) => acc + curr.currentStreak, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          My Profile 👤
        </Text>
      </View>

      {/* User Card */}
      <Surface style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.avatar}
          />
          <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.levelBadgeText}>Lvl {user.currentLevel}</Text>
          </View>
        </View>

        <Text variant="titleLarge" style={[styles.userName, { color: colors.text }]}>
          {user.name}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user.email}
        </Text>
        <Text style={[styles.joinedText, { color: colors.primary }]}>
          Member since {user.joinedDate}
        </Text>

        {/* XP Progress Bar */}
        <View style={styles.xpContainer}>
          <View style={styles.xpLabelRow}>
            <Text style={[styles.xpLabel, { color: colors.textSecondary }]}>XP Progress</Text>
            <Text style={[styles.xpValue, { color: colors.gold }]}>{user.xpPoints} / 2000 XP</Text>
          </View>
          <View style={[styles.xpBarTrack, { backgroundColor: colors.surfaceVariant }]}>
            <View
              style={[
                styles.xpBarFill,
                { backgroundColor: colors.primary, width: `${(user.xpPoints / 2000) * 100}%` },
              ]}
            />
          </View>
        </View>
      </Surface>

      {/* Quick Stats Grid */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Lifetime Overview</Text>

      <View style={styles.statsGrid}>
        <Surface style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="check-circle" size={28} color={colors.accent} />
          <Text variant="titleLarge" style={[styles.statNumber, { color: colors.text }]}>
            {user.totalHabitsCompleted}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
        </Surface>

        <Surface style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="fire" size={28} color={colors.gold} />
          <Text variant="titleLarge" style={[styles.statNumber, { color: colors.text }]}>
            {totalStreaks}d
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Streaks</Text>
        </Surface>

        <Surface style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="target" size={28} color={colors.primary} />
          <Text variant="titleLarge" style={[styles.statNumber, { color: colors.text }]}>
            {totalCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Habits</Text>
        </Surface>
      </View>

      {/* App Settings Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences & Settings</Text>

      <Surface style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* Dark / Light Mode Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'weather-sunny'}
                size={22}
                color={colors.primary}
              />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                {isDark ? 'Dark Theme' : 'Light Theme'}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                {isDark ? 'Sleek dark mode enabled' : 'Clean light mode enabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: colors.primary }}
            thumbColor={isDark ? '#FFF' : '#FFF'}
          />
        </View>

        <Divider style={{ backgroundColor: colors.cardBorder, marginVertical: 12 }} />

        {/* Notifications Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={colors.accent} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Daily Reminders</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Get notified for habit check-ins
              </Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#CBD5E1', true: colors.accent }}
            thumbColor="#FFF"
          />
        </View>

        <Divider style={{ backgroundColor: colors.cardBorder, marginVertical: 12 }} />

        {/* Account Safety */}
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.gold} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Account & Security</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Manage Appwrite session</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </Surface>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={[styles.signOutBtn, { borderColor: colors.error }]}
        onPress={() => router.replace('/auth')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
        <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out of App</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  userCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  joinedText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  xpContainer: {
    width: '100%',
    marginTop: 18,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    width: '31%',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  settingsCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  settingSub: {
    fontSize: 12,
    marginTop: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 8,
  },
  signOutText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
