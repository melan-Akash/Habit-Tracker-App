import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Surface, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../lib/theme-context';
import { useHabits } from '../../lib/habit-store';
import { HabitCategory } from '../../types/database.type';

const categoriesList: { label: string; value: HabitCategory; icon: string; color: string }[] = [
  { label: 'Fitness', value: 'fitness', icon: 'dumbbell', color: '#FF5252' },
  { label: 'Mind', value: 'mind', icon: 'meditation', color: '#8C7CFF' },
  { label: 'Health', value: 'health', icon: 'water-outline', color: '#00E676' },
  { label: 'Learning', value: 'learning', icon: 'book-open-variant', color: '#FFB74D' },
  { label: 'Work', value: 'work', icon: 'code-tags', color: '#6C5CE7' },
  { label: 'Creativity', value: 'creativity', icon: 'palette', color: '#FF6584' },
];

const colorsList = ['#8C7CFF', '#00E676', '#FFB74D', '#FF5252', '#FF6584', '#00B894', '#0984E3'];

export default function AddHabitScreen() {
  const { colors } = useAppTheme();
  const { addHabit } = useHabits();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('fitness');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [targetCount, setTargetCount] = useState('10');
  const [unit, setUnit] = useState('mins');
  const [selectedColor, setSelectedColor] = useState('#8C7CFF');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('anytime');

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
    });

    // Reset and navigate to index
    setTitle('');
    setDescription('');
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

          {/* Time of Day */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Preferred Time of Day</Text>
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
          Save & Start Habit 🚀
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
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
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