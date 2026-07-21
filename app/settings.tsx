import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Text, Surface, Divider, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme, ThemeMode } from '../lib/theme-context';

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode, isDark } = useAppTheme();
  const router = useRouter();

  const [morningReminder, setMorningReminder] = useState<boolean>(true);
  const [eveningReminder, setEveningReminder] = useState<boolean>(true);
  const [hapticSound, setHapticSound] = useState<boolean>(true);

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all habit progress and streaks? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Data Reset', 'All habit data has been reset.') },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          App Settings ⚙️
        </Text>
      </View>

      {/* Theme & Display Options */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme & Display</Text>

      <Surface style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.settingRowHeader}>
          <MaterialCommunityIcons name="theme-light-dark" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>Theme Mode</Text>
            <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
              Auto mode turns Dark after 6:00 PM 🌆
            </Text>
          </View>
        </View>

        <SegmentedButtons
          value={themeMode}
          onValueChange={(val) => setThemeMode(val as ThemeMode)}
          style={{ marginTop: 12 }}
          buttons={[
            { value: 'auto', label: 'Auto 🌙' },
            { value: 'dark', label: 'Dark 🌑' },
            { value: 'light', label: 'Light ☀️' },
          ]}
        />

        <View style={styles.currentModeIndicator}>
          <Text style={[styles.currentModeText, { color: colors.accent }]}>
            Active Theme: {isDark ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
          </Text>
        </View>
      </Surface>

      {/* Reminders & Notifications */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications & Reminders</Text>

      <Surface style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="weather-sunset-up" size={22} color={colors.gold} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Morning Check-in (8:00 AM)</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Start your day with habits</Text>
            </View>
          </View>
          <Switch
            value={morningReminder}
            onValueChange={setMorningReminder}
            trackColor={{ false: '#CBD5E1', true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        <Divider style={{ backgroundColor: colors.cardBorder, marginVertical: 12 }} />

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="weather-night" size={22} color={colors.secondary} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Evening Reflection (8:00 PM)</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Review daily completions</Text>
            </View>
          </View>
          <Switch
            value={eveningReminder}
            onValueChange={setEveningReminder}
            trackColor={{ false: '#CBD5E1', true: colors.primary }}
            thumbColor="#FFF"
          />
        </View>
      </Surface>

      {/* Sound & Feedback */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Haptics & Feedback</Text>

      <Surface style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="vibrate" size={22} color={colors.accent} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Vibration Feedback</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Tactile response when checking habits</Text>
            </View>
          </View>
          <Switch
            value={hapticSound}
            onValueChange={setHapticSound}
            trackColor={{ false: '#CBD5E1', true: colors.accent }}
            thumbColor="#FFF"
          />
        </View>
      </Surface>

      {/* Data Management */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Data & Account</Text>

      <Surface style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="export-variant" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Export Habit Backup</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Save habits as JSON format</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <Divider style={{ backgroundColor: colors.cardBorder, marginVertical: 12 }} />

        <TouchableOpacity style={styles.settingRow} onPress={handleResetData} activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.error + '22' }]}>
              <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
            </View>
            <View>
              <Text style={[styles.settingTitle, { color: colors.error }]}>Reset All Data</Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>Clear all streaks & habits</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </Surface>

      {/* About App Footer */}
      <View style={styles.aboutFooter}>
        <Text style={[styles.aboutTitle, { color: colors.text }]}>Habit Tracker App ⚡</Text>
        <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>Version 1.2.0 • Build 2026</Text>
      </View>
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
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 20,
  },
  settingRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  currentModeIndicator: {
    marginTop: 12,
    alignItems: 'center',
  },
  currentModeText: {
    fontWeight: 'bold',
    fontSize: 13,
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
  aboutFooter: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  aboutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  aboutVersion: {
    fontSize: 12,
    marginTop: 4,
  },
});
