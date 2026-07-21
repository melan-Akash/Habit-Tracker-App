import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Surface, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../lib/theme-context';
import { useHabits } from '../../lib/habit-store';
import { HabitCategory } from '../../types/database.type';

const categories: { label: string; value: string; icon: string }[] = [
  { label: 'All', value: 'all', icon: 'apps' },
  { label: 'Fitness', value: 'fitness', icon: 'dumbbell' },
  { label: 'Mind', value: 'mind', icon: 'meditation' },
  { label: 'Health', value: 'health', icon: 'water-outline' },
  { label: 'Learning', value: 'learning', icon: 'book-open-variant' },
  { label: 'Work', value: 'work', icon: 'code-tags' },
  { label: 'Creativity', value: 'creativity', icon: 'palette' },
];

const quotes = [
  "Small daily habits compound into massive lifetime success. 🚀",
  "Consistency is the key to unlocking your full potential! 🔥",
  "You don't have to be extreme, just consistent. 💡",
  "Motivation gets you started. Habit keeps you going. ✨",
];

export default function HomeScreen() {
  const { isDark, colors, toggleTheme } = useAppTheme();
  const { habits, toggleHabit, deleteHabit, user } = useHabits();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Date formatted
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Filtered habits
  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter((h) => h.category === selectedCategory);

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
  };

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.dateText, { color: colors.primary }]}>{todayDateStr.toUpperCase()}</Text>
          <Text variant="headlineMedium" style={[styles.welcomeText, { color: colors.text }]}>
            Hello, {user.name.split(' ')[0]} 👋
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-sunny' : 'weather-night'}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Banner */}
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.progressBanner}
      >
        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Daily Progress</Text>
            <Text style={styles.bannerSubtitle}>
              {completedCount} of {totalCount} habits completed today
            </Text>
          </View>
          <View style={styles.percentageCircle}>
            <Text style={styles.percentageText}>{completionPercentage}%</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${completionPercentage}%` },
            ]}
          />
        </View>
      </LinearGradient>

      {/* Motivational Quote Banner */}
      <Surface style={[styles.quoteCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <MaterialCommunityIcons name="format-quote-open" size={24} color={colors.primary} />
        <Text style={[styles.quoteText, { color: colors.text }]}>{quotes[quoteIndex]}</Text>
        <TouchableOpacity onPress={handleNextQuote} style={styles.quoteRefreshBtn}>
          <MaterialCommunityIcons name="refresh" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </Surface>

      {/* Category Filter Chips */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setSelectedCategory(cat.value)}
              activeOpacity={0.7}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.cardBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={cat.icon as any}
                size={16}
                color={isSelected ? '#FFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  { color: isSelected ? '#FFF' : colors.text },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Today's Habits Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Today's Habits ({filteredHabits.length})
        </Text>
        <TouchableOpacity onPress={() => router.push('/add-habit')}>
          <Text style={[styles.addNewText, { color: colors.primary }]}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <Surface style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="emoticon-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No habits in this category yet!</Text>
          <TouchableOpacity
            style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-habit')}
          >
            <Text style={styles.emptyAddBtnText}>Create a Habit</Text>
          </TouchableOpacity>
        </Surface>
      ) : (
        filteredHabits.map((habit) => (
          <Surface
            key={habit.id}
            style={[
              styles.habitCard,
              {
                backgroundColor: colors.card,
                borderColor: habit.completedToday ? colors.accent : colors.cardBorder,
                borderLeftWidth: 5,
                borderLeftColor: habit.color || colors.primary,
              },
            ]}
          >
            <View style={styles.cardMainRow}>
              {/* Checkbox Button */}
              <TouchableOpacity
                onPress={() => toggleHabit(habit.id)}
                activeOpacity={0.7}
                style={[
                  styles.checkBtn,
                  {
                    backgroundColor: habit.completedToday ? colors.accent : colors.surfaceVariant,
                    borderColor: habit.completedToday ? colors.accent : colors.cardBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={habit.completedToday ? 'check-bold' : 'minus'}
                  size={20}
                  color={habit.completedToday ? '#FFF' : colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Title & Details */}
              <View style={styles.habitInfo}>
                <Text
                  style={[
                    styles.habitTitle,
                    {
                      color: colors.text,
                      textDecorationLine: habit.completedToday ? 'line-through' : 'none',
                      opacity: habit.completedToday ? 0.7 : 1,
                    },
                  ]}
                >
                  {habit.title}
                </Text>
                <Text style={[styles.habitDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                  {habit.description}
                </Text>

                {/* Badges Row */}
                <View style={styles.badgesRow}>
                  <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
                    <MaterialCommunityIcons name="fire" size={13} color={colors.gold} />
                    <Text style={[styles.badgeText, { color: colors.gold }]}>
                      {habit.currentStreak}d streak
                    </Text>
                  </View>

                  <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>
                      {habit.targetCount} {habit.unit}
                    </Text>
                  </View>

                  {habit.timeOfDay && (
                    <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
                      <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                        {habit.timeOfDay}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Menu / Delete */}
              <TouchableOpacity
                onPress={() => confirmDelete(habit.id, habit.title)}
                style={styles.deleteBtn}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </Surface>
        ))
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  welcomeText: {
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBanner: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  percentageCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  percentageText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  quoteCard: {
    borderRadius: 16,
    padding: 14,
    paddingRight: 40,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    position: 'relative',
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    flex: 1,
  },
  quoteRefreshBtn: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addNewText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chipScrollView: {
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyAddBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  habitCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: 6,
  },
});