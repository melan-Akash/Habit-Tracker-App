import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../lib/theme-context';
import { useHabits } from '../../lib/habit-store';
import { aiAPI } from '../../lib/api';

export default function StreaksScreen() {
  const { colors } = useAppTheme();
  const { habits, badges } = useHabits();

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    fetchAiAnalysis();
  }, []);

  const fetchAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const res = await aiAPI.analyzeProgress();
      if (res.success) {
        setAiAnalysis(res);
      }
    } catch (e: any) {
      console.log('AI Analysis error:', e.message);
    } finally {
      setLoadingAi(false);
    }
  };

  const sortedHabits = [...habits].sort((a, b) => b.currentStreak - a.currentStreak);
  const top3 = sortedHabits.slice(0, 3);
  const bestStreakOverall = Math.max(...habits.map((h) => h.bestStreak), 0);
  const totalStreaksSum = habits.reduce((acc, h) => acc + h.currentStreak, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          Streaks & Analytics 🏆
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your momentum with Llama 3.1 70B AI predictions
        </Text>
      </View>

      {/* AI Smart Performance & Risk Card */}
      <Surface style={[styles.aiCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
        <View style={styles.aiHeaderRow}>
          <View style={styles.aiTitleGroup}>
            <MaterialCommunityIcons name="robot" size={24} color={colors.primary} />
            <Text style={[styles.aiCardTitle, { color: colors.text }]}>
              {aiAnalysis?.statusTitle || 'AI Consistency Score'}
            </Text>
          </View>
          <View style={[styles.aiScoreBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.aiScoreText}>{aiAnalysis?.score || 88}/100</Text>
          </View>
        </View>

        <Text style={[styles.aiAnalysisText, { color: colors.text }]}>
          {aiAnalysis?.analysis || 'Your habit consistency is in the top 15% this week! 🔥 Keep up the momentum.'}
        </Text>

        {aiAnalysis?.riskHabit && aiAnalysis.riskHabit !== 'None' && (
          <View style={[styles.riskWarningBox, { backgroundColor: colors.error + '18' }]}>
            <MaterialCommunityIcons name="alert-decagram" size={18} color={colors.error} />
            <Text style={[styles.riskWarningText, { color: colors.error }]}>
              At Risk: {aiAnalysis.riskHabit}
            </Text>
          </View>
        )}

        <Text style={[styles.aiRecText, { color: colors.textSecondary }]}>
          💡 {aiAnalysis?.recommendation || 'Complete pending habits before 8 PM to protect your 7-day streak!'}
        </Text>

        <TouchableOpacity onPress={fetchAiAnalysis} style={styles.aiRefreshBtn}>
          <Text style={[styles.aiRefreshText, { color: colors.primary }]}>
            {loadingAi ? 'AI Analyzing...' : '🔄 Re-Analyze Progress'}
          </Text>
        </TouchableOpacity>
      </Surface>

      {/* Top 3 Podio Banner */}
      <Surface style={[styles.leaderboardCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.leaderboardHeader}>
          <MaterialCommunityIcons name="trophy" size={24} color={colors.gold} />
          <Text style={[styles.leaderboardTitle, { color: colors.text }]}>Top Active Streaks</Text>
        </View>

        <View style={styles.podioContainer}>
          {top3.map((habit, index) => {
            const isGold = index === 0;
            const isSilver = index === 1;
            const isBronze = index === 2;
            const rankColor = isGold ? colors.gold : isSilver ? colors.silver : colors.bronze;

            return (
              <View
                key={habit.id}
                style={[
                  styles.podioItem,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: rankColor,
                    borderWidth: isGold ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
                  <Text style={styles.rankBadgeText}>#{index + 1}</Text>
                </View>

                <MaterialCommunityIcons
                  name={(habit.icon as any) || 'fire'}
                  size={26}
                  color={habit.color || colors.primary}
                />

                <Text style={[styles.podioHabitTitle, { color: colors.text }]} numberOfLines={1}>
                  {habit.title}
                </Text>

                <View style={styles.streakCountRow}>
                  <MaterialCommunityIcons name="fire" size={16} color={colors.gold} />
                  <Text style={[styles.streakCountText, { color: colors.gold }]}>
                    {habit.currentStreak}d
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Surface>

      {/* Quick Overview Stats */}
      <View style={styles.statsRow}>
        <Surface style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="lightning-bolt" size={26} color={colors.gold} />
          <Text variant="titleLarge" style={[styles.statValue, { color: colors.text }]}>
            {bestStreakOverall} Days
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Record</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <MaterialCommunityIcons name="fire" size={26} color={colors.secondary} />
          <Text variant="titleLarge" style={[styles.statValue, { color: colors.text }]}>
            {totalStreaksSum} Days
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Active</Text>
        </Surface>
      </View>

      {/* Achievements Badges Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Unlocked Badges 🎖️</Text>
      </View>

      <View style={styles.badgesGrid}>
        {badges.map((badge) => (
          <Surface
            key={badge.id}
            style={[
              styles.badgeCard,
              {
                backgroundColor: colors.card,
                borderColor: badge.unlocked ? badge.color : colors.cardBorder,
                borderWidth: badge.unlocked ? 1.5 : 1,
                opacity: badge.unlocked ? 1 : 0.6,
              },
            ]}
          >
            <View
              style={[
                styles.badgeIconCircle,
                { backgroundColor: badge.unlocked ? badge.color + '22' : colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name={badge.icon as any}
                size={28}
                color={badge.unlocked ? badge.color : colors.textSecondary}
              />
            </View>

            <Text style={[styles.badgeTitle, { color: colors.text }]}>{badge.title}</Text>
            <Text style={[styles.badgeDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {badge.description}
            </Text>

            {/* Progress bar */}
            <View style={styles.badgeProgressTrack}>
              <View
                style={[
                  styles.badgeProgressFill,
                  {
                    backgroundColor: badge.unlocked ? badge.color : colors.textSecondary,
                    width: `${badge.progress}%`,
                  },
                ]}
              />
            </View>
          </Surface>
        ))}
      </View>

      {/* Detailed Habit Streak Breakdown */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>All Habit Breakdown</Text>
      </View>

      {sortedHabits.map((habit) => (
        <Surface
          key={habit.id}
          style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        >
          <View style={styles.breakdownRow}>
            <View style={[styles.habitIconBg, { backgroundColor: (habit.color || colors.primary) + '22' }]}>
              <MaterialCommunityIcons
                name={(habit.icon as any) || 'star'}
                size={24}
                color={habit.color || colors.primary}
              />
            </View>

            <View style={styles.breakdownInfo}>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>{habit.title}</Text>
              <Text style={[styles.breakdownSub, { color: colors.textSecondary }]}>
                Best Streak: {habit.bestStreak} Days
              </Text>
            </View>

            <View style={styles.streakBadgeRight}>
              <MaterialCommunityIcons name="fire" size={18} color={colors.gold} />
              <Text style={[styles.streakValueText, { color: colors.gold }]}>
                {habit.currentStreak}d
              </Text>
            </View>
          </View>
        </Surface>
      ))}
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
  aiCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    elevation: 2,
    marginBottom: 20,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiCardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  aiScoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiScoreText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  aiAnalysisText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  riskWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  riskWarningText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  aiRecText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  aiRefreshBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  aiRefreshText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  leaderboardCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 20,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  podioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  podioItem: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  podioHabitTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  streakCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  streakCountText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 1,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  badgeCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    elevation: 1,
  },
  badgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeDesc: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  badgeProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    overflow: 'hidden',
  },
  badgeProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  breakdownSub: {
    fontSize: 12,
    marginTop: 2,
  },
  streakBadgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakValueText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
});