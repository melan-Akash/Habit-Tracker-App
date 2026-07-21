import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Surface, IconButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../lib/theme-context';
import { useHabits } from '../../lib/habit-store';

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

const currentWeek = [
  { dayName: 'Mon', dayNum: 20 },
  { dayName: 'Tue', dayNum: 21 }, // Today
  { dayName: 'Wed', dayNum: 22 },
  { dayName: 'Thu', dayNum: 23 },
  { dayName: 'Fri', dayNum: 24 },
  { dayName: 'Sat', dayNum: 25 },
  { dayName: 'Sun', dayNum: 26 },
];

export default function HomeScreen() {
  const { isDark, colors, toggleTheme, greetingMessage } = useAppTheme();
  const { habits, toggleHabit, deleteHabit, user } = useHabits();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number>(21);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const filteredHabits = habits.filter((h) => {
    const matchesCategory = selectedCategory === 'all' || h.category === selectedCategory;
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        <View style={{ flex: 1 }}>
          <Text style={[styles.dateText, { color: colors.primary }]}>{todayDateStr.toUpperCase()}</Text>
          <Text variant="headlineSmall" style={[styles.welcomeText, { color: colors.text }]}>
            {greetingMessage}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isDark ? 'weather-sunny' : 'weather-night'}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Prominent Quick Access Menu Bar (Calendar, Streaks, Settings) */}
      <View style={styles.dashboardMenuRow}>
        <Surface style={[styles.menuChipCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <TouchableOpacity
            style={styles.menuChipTouchable}
            onPress={() => router.push('/calendar')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="calendar-month" size={20} color={colors.primary} />
            <Text style={[styles.menuChipText, { color: colors.text }]}>Calendar 📅</Text>
          </TouchableOpacity>
        </Surface>

        <Surface style={[styles.menuChipCard, { backgroundColor: colors.card, borderColor: colors.gold }]}>
          <TouchableOpacity
            style={styles.menuChipTouchable}
            onPress={() => router.push('/streaks')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="fire" size={20} color={colors.gold} />
            <Text style={[styles.menuChipText, { color: colors.text }]}>Streaks 🏆</Text>
          </TouchableOpacity>
        </Surface>

        <Surface style={[styles.menuChipCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={styles.menuChipTouchable}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="cog-outline" size={20} color={colors.secondary} />
            <Text style={[styles.menuChipText, { color: colors.text }]}>Settings ⚙️</Text>
          </TouchableOpacity>
        </Surface>
      </View>

      {/* Horizontal Weekly Calendar Strip */}
      <View style={styles.weekStripContainer}>
        {currentWeek.map((item) => {
          const isSelected = selectedDay === item.dayNum;
          const isToday = item.dayNum === 21;

          return (
            <TouchableOpacity
              key={item.dayNum}
              onPress={() => setSelectedDay(item.dayNum)}
              activeOpacity={0.7}
              style={[
                styles.weekDayPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.cardBorder,
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.weekDayName,
                  { color: isSelected ? '#FFF' : colors.textSecondary },
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.weekDayNum,
                  { color: isSelected ? '#FFF' : colors.text },
                ]}
              >
                {item.dayNum}
              </Text>
              {isToday && (
                <View
                  style={[
                    styles.todayIndicator,
                    { backgroundColor: isSelected ? '#FFF' : colors.accent },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
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

      {/* Search Input Bar */}
      <TextInput
        mode="outlined"
        placeholder="Search your habits..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={[styles.searchInput, { backgroundColor: colors.card }]}
        outlineColor={colors.cardBorder}
        activeOutlineColor={colors.primary}
        textColor={colors.text}
        left={<TextInput.Icon icon="magnify" color={colors.textSecondary} />}
        right={
          searchQuery ? (
            <TextInput.Icon icon="close-circle" color={colors.textSecondary} onPress={() => setSearchQuery('')} />
          ) : null
        }
      />

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
          Habits ({filteredHabits.length})
        </Text>
        <TouchableOpacity onPress={() => router.push('/add-habit')}>
          <Text style={[styles.addNewText, { color: colors.primary }]}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <Surface style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="emoticon-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No habits found!</Text>
          <TouchableOpacity
            style={[styles.emptyAddBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-habit')}
          >
            <Text style={styles.emptyAddBtnText}>Create a Habit</Text>
          </TouchableOpacity>
        </Surface>
      ) : (
        filteredHabits.map((habit, index) => {
          const habitId = habit.id || (habit as any)._id || `habit-key-${index}`;
          return (
            <Surface
              key={habitId}
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
                  onPress={() => toggleHabit(habitId)}
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

                  {habit.reminderTime && (
                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                      <MaterialCommunityIcons name="bell-ring-outline" size={13} color={colors.primary} />
                      <Text style={[styles.badgeText, { color: colors.primary, fontWeight: 'bold' }]}>
                        {habit.reminderTime}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Menu / Delete */}
              <TouchableOpacity
                onPress={() => confirmDelete(habitId, habit.title)}
                style={styles.deleteBtn}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </Surface>
          );
        })
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
    marginBottom: 16,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  welcomeText: {
    fontWeight: 'bold',
    marginTop: 2,
    fontSize: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekStripContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  weekDayPill: {
    width: '13%',
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  weekDayName: {
    fontSize: 11,
    fontWeight: '600',
  },
  weekDayNum: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  todayIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 6,
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
  searchInput: {
    marginBottom: 16,
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
    fontWeight: '600',
  },
  dashboardMenuRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: 6,
  },
  menuChipCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  menuChipTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  menuChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: 6,
  },
});