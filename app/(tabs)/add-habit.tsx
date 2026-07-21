import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Surface, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../lib/theme-context';
import { useHabits } from '../../lib/habit-store';
import { HabitCategory } from '../../types/database.type';
import { aiAPI } from '../../lib/api';

const categoriesList: { label: string; value: HabitCategory; icon: string; color: string }[] = [
  { label: 'Fitness', value: 'fitness', icon: 'dumbbell', color: '#FF5252' },
  { label: 'Mind', value: 'mind', icon: 'meditation', color: '#8C7CFF' },
  { label: 'Health', value: 'health', icon: 'water-outline', color: '#00E676' },
  { label: 'Learning', value: 'learning', icon: 'book-open-variant', color: '#FFB74D' },
  { label: 'Work', value: 'work', icon: 'code-tags', color: '#6C5CE7' },
  { label: 'Creativity', value: 'creativity', icon: 'palette', color: '#FF6584' },
];

const colorsList = ['#8C7CFF', '#00E676', '#FFB74D', '#FF5252', '#FF6584', '#00B894', '#0984E3'];

const presetTimes = [
  { label: '07:00 AM', value: '07:00' },
  { label: '08:00 AM', value: '08:00' },
  { label: '12:30 PM', value: '12:30' },
  { label: '06:00 PM', value: '18:00' },
  { label: '08:30 PM', value: '20:30' },
];

export default function AddHabitScreen() {
  const { colors } = useAppTheme();
  const { addHabit } = useHabits();
  const router = useRouter();

  const [naturalText, setNaturalText] = useState('');
  const [parsingAi, setParsingAi] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('fitness');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [targetCount, setTargetCount] = useState('10');
  const [unit, setUnit] = useState('mins');
  const [selectedColor, setSelectedColor] = useState('#FF5252');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('anytime');
  const [reminderTime, setReminderTime] = useState<string>('08:00');

  // AI Magic Text Parser - Auto-Fills ALL Fields Completely
  const handleAiParse = async () => {
    if (!naturalText.trim()) return;
    setParsingAi(true);

    try {
      const res = await aiAPI.parseTextToHabit(naturalText.trim());
      if (res.habit) {
        const h = res.habit;
        if (h.title) setTitle(h.title);
        if (h.description) setDescription(h.description);
        if (h.category) {
          setCategory(h.category);
          const catColor = categoriesList.find((c) => c.value === h.category)?.color;
          if (catColor) setSelectedColor(catColor);
        }
        if (h.targetCount) setTargetCount(h.targetCount.toString());
        if (h.unit) setUnit(h.unit);
        if (h.color) setSelectedColor(h.color);
        if (h.timeOfDay) setTimeOfDay(h.timeOfDay);
        if (h.reminderTime) setReminderTime(h.reminderTime);
      }
    } catch (e: any) {
      console.log('AI Parse error fallback:', e.message);
      setTitle(naturalText.trim());
      setDescription(`Daily habit: ${naturalText.trim()}`);
    } finally {
      setParsingAi(false);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const selectedCategoryItem = categoriesList.find((c) => c.value === category);

    addHabit({
      title: title.trim(),
      description: description.trim() || `${title} habit`,
      category,
      frequency,
      targetCount: parseFloat(targetCount) || 1,
      unit: unit.trim() || 'times',
      color: selectedColor,
      icon: selectedCategoryItem?.icon || 'check',
      currentStreak: 0,
      bestStreak: 0,
      completedToday: false,
      timeOfDay,
      reminderTime,
    });

    setTitle('');
    setDescription('');
    setNaturalText('');
    router.push('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
            Create New Habit ✨
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Build small habits, achieve big goals!
          </Text>
        </View>

        {/* AI Magic Text Input Banner */}
        <Surface style={[styles.aiMagicCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <View style={styles.aiMagicRow}>
            <MaterialCommunityIcons name="auto-fix" size={22} color={colors.primary} />
            <Text style={[styles.aiMagicTitle, { color: colors.text }]}>AI Magic Complete Auto-Fill</Text>
          </View>
          <Text style={[styles.aiMagicSub, { color: colors.textSecondary }]}>
            Type any sentence below, and AI will automatically populate ALL fields & notification time!
          </Text>

          <TextInput
            mode="outlined"
            placeholder="e.g. Read 20 pages every night before sleeping"
            value={naturalText}
            onChangeText={setNaturalText}
            style={[styles.input, { backgroundColor: colors.inputBg, marginTop: 8 }]}
            outlineColor={colors.cardBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
          />

          <Button
            mode="contained"
            onPress={handleAiParse}
            loading={parsingAi}
            disabled={!naturalText.trim() || parsingAi}
            style={[styles.aiParseBtn, { backgroundColor: colors.primary }]}
            icon="shimmer"
          >
            Auto-Fill All Fields Below 🪄
          </Button>
        </Surface>

        {/* Habit Card Form */}
        <Surface style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {/* Title Input */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Habit Name *</Text>
          <TextInput
            mode="outlined"
            placeholder="e.g. Read 15 Pages, 30 Min Workout"
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { backgroundColor: colors.inputBg }]}
            outlineColor={colors.cardBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
          />

          {/* Description Input */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description (Optional)</Text>
          <TextInput
            mode="outlined"
            placeholder="e.g. Read before going to bed"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { backgroundColor: colors.inputBg }]}
            outlineColor={colors.cardBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
          />

          {/* Category Selector */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Select Category</Text>
          <View style={styles.categoryGrid}>
            {categoriesList.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => {
                    setCategory(cat.value);
                    setSelectedColor(cat.color);
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.categoryBox,
                    {
                      backgroundColor: isSelected ? colors.surfaceVariant : colors.inputBg,
                      borderColor: isSelected ? cat.color : colors.cardBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={24}
                    color={cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryBoxText,
                      { color: isSelected ? colors.text : colors.textSecondary },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Target Goal & Unit */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Daily Goal & Unit</Text>
          <View style={styles.targetRow}>
            <TextInput
              mode="outlined"
              placeholder="Target (e.g. 10)"
              keyboardType="numeric"
              value={targetCount}
              onChangeText={setTargetCount}
              style={[styles.targetInput, { backgroundColor: colors.inputBg }]}
              outlineColor={colors.cardBorder}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
            <TextInput
              mode="outlined"
              placeholder="Unit (e.g. mins, pages, liters)"
              value={unit}
              onChangeText={setUnit}
              style={[styles.unitInput, { backgroundColor: colors.inputBg }]}
              outlineColor={colors.cardBorder}
              activeOutlineColor={colors.primary}
              textColor={colors.text}
            />
          </View>

          {/* Scheduled Reminder Notification Time */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Scheduled Notification Time 🔔</Text>
          <View style={styles.timeOfDayRow}>
            {presetTimes.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setReminderTime(item.value)}
                style={[
                  styles.timeChip,
                  {
                    backgroundColor: reminderTime === item.value ? colors.primary : colors.inputBg,
                    borderColor: reminderTime === item.value ? colors.primary : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    { color: reminderTime === item.value ? '#FFF' : colors.text },
                  ]}
                >
                  ⏰ {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time of Day */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Preferred Period</Text>
          <View style={styles.timeOfDayRow}>
            {[
              { value: 'morning', label: 'Morning 🌅' },
              { value: 'afternoon', label: 'Afternoon ☀️' },
              { value: 'evening', label: 'Evening 🌙' },
              { value: 'anytime', label: 'Anytime ⚡' },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setTimeOfDay(item.value as any)}
                style={[
                  styles.timeChip,
                  {
                    backgroundColor: timeOfDay === item.value ? colors.primary : colors.inputBg,
                    borderColor: timeOfDay === item.value ? colors.primary : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    { color: timeOfDay === item.value ? '#FFF' : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Accent Color Picker */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Card Accent Color</Text>
          <View style={styles.colorRow}>
            {colorsList.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedColor(c)}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: c,
                    borderColor: selectedColor === c ? '#FFF' : 'transparent',
                    borderWidth: selectedColor === c ? 3 : 0,
                  },
                ]}
              >
                {selectedColor === c && (
                  <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Surface>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!title.trim()}
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          contentStyle={{ height: 50 }}
          labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
        >
          Save & Schedule Habit 🚀
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
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
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  aiMagicCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    elevation: 2,
    marginBottom: 20,
  },
  aiMagicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiMagicTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  aiMagicSub: {
    fontSize: 12,
    marginTop: 2,
  },
  aiParseBtn: {
    marginTop: 10,
    borderRadius: 14,
  },
  formCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  categoryBox: {
    width: '31%',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  categoryBoxText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  targetInput: {
    flex: 1,
  },
  unitInput: {
    flex: 2,
  },
  timeOfDayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    borderRadius: 16,
    elevation: 3,
  },
});