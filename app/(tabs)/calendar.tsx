import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, Surface, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../lib/theme-context';
import { useHabits } from '../../lib/habit-store';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const { habits } = useHabits();

  const [selectedDate, setSelectedDate] = useState<number>(21); // July 21
  const [currentMonth, setCurrentMonth] = useState<string>('July 2026');

  // Generating 31 days for current month demo
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  // Mock completion data for days
  const getDayStatus = (day: number) => {
    if (day > 21) return 'future';
    if ([5, 8, 12, 15, 18, 20, 21].includes(day)) return 'perfect';
    if ([2, 4, 7, 9, 11, 14, 17, 19].includes(day)) return 'partial';
    return 'missed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect':
        return colors.accent; // Green
      case 'partial':
        return colors.gold; // Yellow/Orange
      case 'missed':
        return colors.error; // Red
      default:
        return colors.surfaceVariant;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          Habit History & Calendar 📅
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your monthly consistency at a glance
        </Text>
      </View>

      {/* Monthly Overview Stats */}
      <View style={styles.statsRow}>
        <Surface style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="star-circle" size={26} color={colors.accent} />
          <Text variant="titleLarge" style={[styles.statValue, { color: colors.text }]}>
            84%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Monthly Score</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="check-decagram" size={26} color={colors.gold} />
          <Text variant="titleLarge" style={[styles.statValue, { color: colors.text }]}>
            14 Days
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Perfect Days</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="fire" size={26} color={colors.primary} />
          <Text variant="titleLarge" style={[styles.statValue, { color: colors.text }]}>
            7 Days
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Streak</Text>
        </Surface>
      </View>

      {/* Calendar Card */}
      <Surface style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {/* Month Selector Bar */}
        <View style={styles.monthHeader}>
          <TouchableOpacity style={styles.monthNavBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.monthTitle, { color: colors.text }]}>{currentMonth}</Text>

          <TouchableOpacity style={styles.monthNavBtn}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Legend Indicator */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>100% Done</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.gold }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Partial</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Missed</Text>
          </View>
        </View>

        <Divider style={{ backgroundColor: colors.cardBorder, marginVertical: 12 }} />

        {/* Days of Week Row */}
        <View style={styles.daysOfWeekRow}>
          {DAYS_OF_WEEK.map((day) => (
            <Text key={day} style={[styles.dayOfWeekText, { color: colors.textSecondary }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Month Grid */}
        <View style={styles.daysGrid}>
          {daysInMonth.map((day) => {
            const status = getDayStatus(day);
            const statusColor = getStatusColor(status);
            const isSelected = selectedDate === day;

            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDate(day)}
                activeOpacity={0.7}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    { color: isSelected ? '#FFF' : colors.text },
                  ]}
                >
                  {day}
                </Text>

                {/* Status dot */}
                {status !== 'future' && (
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isSelected ? '#FFF' : statusColor },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Surface>

      {/* Selected Day Log Breakdown */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Logs for July {selectedDate}, 2026
        </Text>
      </View>

      <Surface style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {habits.map((habit, idx) => {
          // Mock completion state for selected day
          const isDoneOnSelectedDate =
            selectedDate === 21
              ? habit.completedToday
              : (selectedDate + idx) % 2 === 0;

          return (
            <View key={habit.id}>
              {idx > 0 && <Divider style={{ backgroundColor: colors.cardBorder, marginVertical: 10 }} />}

              <View style={styles.logRow}>
                <View
                  style={[
                    styles.logCheckIcon,
                    {
                      backgroundColor: isDoneOnSelectedDate
                        ? colors.accent + '22'
                        : colors.surfaceVariant,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={isDoneOnSelectedDate ? 'check-circle' : 'circle-outline'}
                    size={22}
                    color={isDoneOnSelectedDate ? colors.accent : colors.textSecondary}
                  />
                </View>

                <View style={styles.logInfo}>
                  <Text style={[styles.logHabitTitle, { color: colors.text }]}>{habit.title}</Text>
                  <Text style={[styles.logHabitSub, { color: colors.textSecondary }]}>
                    {isDoneOnSelectedDate ? 'Completed' : 'Not completed'} • {habit.targetCount} {habit.unit}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.logStatusBadge,
                    {
                      color: isDoneOnSelectedDate ? colors.accent : colors.textSecondary,
                    },
                  ]}
                >
                  {isDoneOnSelectedDate ? 'Done 🟢' : 'Pending ⚪'}
                </Text>
              </View>
            </View>
          );
        })}
      </Surface>
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
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 1,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  calendarCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 24,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthNavBtn: {
    padding: 6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayOfWeekText: {
    width: '13%',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '12.8%',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayNumberText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    position: 'absolute',
    bottom: 5,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    elevation: 2,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logCheckIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: {
    flex: 1,
  },
  logHabitTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  logHabitSub: {
    fontSize: 12,
    marginTop: 2,
  },
  logStatusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
