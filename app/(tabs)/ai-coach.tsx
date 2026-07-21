import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text, Surface, TextInput, Button, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../lib/theme-context';
import { useHabits } from '../../lib/habit-store';
import { aiAPI } from '../../lib/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const quickPrompts = [
  '⚡ Suggest a 10-min Morning Routine',
  '🧠 How to stop procrastinating?',
  '🤖 What can you do for me?',
  '📚 Tips to study 2 hours daily',
];

export default function AICoachScreen() {
  const { colors } = useAppTheme();
  const { addHabit } = useHabits();
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm Nova, your interactive AI Habit Coach powered by Meta Llama 3.1 70B 🤖. Tell me, what is your #1 goal or habit you want to build right now?",
      time: 'Just now',
    },
  ]);

  // Routine Generator Modal state
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>('');
  const [generatingRoutine, setGeneratingRoutine] = useState<boolean>(false);
  const [generatedHabits, setGeneratedHabits] = useState<any[]>([]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const historyForLlm = messages.map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const lowerQuery = query.trim().toLowerCase();

    try {
      const res = await aiAPI.chat(query, historyForLlm);
      const aiReply = res.reply || 'Great goal! What time of day works best for you? 🔥';

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.log('AI Chat Fallback Response triggered:', err.message);

      let responseText = `That sounds like a great focus! 🚀 Starting small helps build momentum. What time of day works best for you to practice this habit? ⏰`;

      if (['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'hola', 'sup', 'watsup', 'how are you'].includes(lowerQuery)) {
        responseText = `Hey there! 👋 Great to see you! I'm Nova, your AI Habit Coach. What specific goal are you focusing on today? 🚀`;
      } else if (
        lowerQuery.includes('what can you do') ||
        lowerQuery.includes('what you can do') ||
        lowerQuery.includes('who are you') ||
        lowerQuery.includes('features')
      ) {
        responseText = `Here is what I can do for you as your AI Coach 🤖:\n\n1. 💬 **2-Way Interactive Coaching**: Ask me questions & answer my follow-ups!\n2. ✨ **Generate Routines**: Tap **'AI Routine'** to create habit plans.\n3. 📊 **Performance Analytics**: Check your consistency score on Streaks screen.\n4. 🪄 **Magic Text Parser**: Auto-fill habit fields on Add Habit screen!\n\nWhich feature would you like to explore first?`;
      } else if (lowerQuery.includes('morning') || lowerQuery.includes('routine')) {
        responseText = `Here is a high-performance Morning Routine: 
1. Drink 500ml water 💧
2. 5 mins stretching & meditation 🧘
3. Read 10 pages before opening your phone 📚

Which of these 3 would you like to start tomorrow morning?`;
      }

      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleGenerateRoutine = async () => {
    if (!goalInput.trim()) return;
    setGeneratingRoutine(true);

    try {
      const res = await aiAPI.generateRoutine(goalInput.trim());
      if (res.habits && res.habits.length > 0) {
        setGeneratedHabits(res.habits);
      }
    } catch (err: any) {
      console.log('AI Routine Generator Fallback:', err.message);
      setGeneratedHabits([
        {
          title: 'Power Hydration',
          description: 'Drink 2.5L water daily',
          category: 'health',
          targetCount: 2.5,
          unit: 'liters',
          frequency: 'daily',
          color: '#00E676',
          icon: 'water-outline',
          timeOfDay: 'morning',
          reminderTime: '08:00',
        },
        {
          title: 'Core Strength Workout',
          description: '20 mins daily bodyweight exercise',
          category: 'fitness',
          targetCount: 20,
          unit: 'mins',
          frequency: 'daily',
          color: '#FF5252',
          icon: 'dumbbell',
          timeOfDay: 'afternoon',
          reminderTime: '17:30',
        },
        {
          title: 'Mindful Reset',
          description: '10 mins evening meditation',
          category: 'mind',
          targetCount: 10,
          unit: 'mins',
          frequency: 'daily',
          color: '#8C7CFF',
          icon: 'meditation',
          timeOfDay: 'evening',
          reminderTime: '20:30',
        },
      ]);
    } finally {
      setGeneratingRoutine(false);
    }
  };

  const handleImportAllHabits = () => {
    generatedHabits.forEach((h) => {
      addHabit({
        title: h.title,
        description: h.description,
        category: h.category,
        frequency: h.frequency || 'daily',
        targetCount: h.targetCount || 1,
        unit: h.unit || 'times',
        color: h.color || '#8C7CFF',
        icon: h.icon || 'check',
        currentStreak: 0,
        bestStreak: 0,
        completedToday: false,
        timeOfDay: h.timeOfDay || 'anytime',
        reminderTime: h.reminderTime || '08:00',
      });
    });

    setGeneratedHabits([]);
    setModalVisible(false);
    setGoalInput('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.topContentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
              AI Habit Coach 🤖
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Powered by Llama 3.1 70B Engine
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.generateBtn, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="auto-fix" size={16} color="#FFF" />
            <Text style={styles.generateBtnText}>AI Routine</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Suggestion Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
          {quickPrompts.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSendMessage(prompt)}
              style={[
                styles.promptChip,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.promptChipText, { color: colors.text }]}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages ScrollArea */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                { justifyContent: isAI ? 'flex-start' : 'flex-end' },
              ]}
            >
              {isAI && (
                <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                  <MaterialCommunityIcons name="robot" size={18} color="#FFF" />
                </View>
              )}

              <Surface
                style={[
                  styles.messageBubble,
                  isAI
                    ? {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        borderWidth: 1,
                        borderTopLeftRadius: 4,
                      }
                    : {
                        backgroundColor: colors.primary,
                        borderTopRightRadius: 4,
                      },
                ]}
              >
                <Text style={[styles.messageText, { color: isAI ? colors.text : '#FFF' }]}>
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    { color: isAI ? colors.textSecondary : 'rgba(255,255,255,0.75)' },
                  ]}
                >
                  {msg.time}
                </Text>
              </Surface>
            </View>
          );
        })}

        {loading && (
          <View style={styles.loadingRow}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="robot" size={18} color="#FFF" />
            </View>
            <Surface style={[styles.loadingBubble, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Llama 3.1 70B is typing...
              </Text>
            </Surface>
          </View>
        )}
      </ScrollView>

      {/* Message Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
        <TextInput
          mode="outlined"
          placeholder="Ask AI Coach anything..."
          value={inputMessage}
          onChangeText={setInputMessage}
          style={[styles.chatInput, { backgroundColor: colors.inputBg }]}
          outlineColor={colors.cardBorder}
          activeOutlineColor={colors.primary}
          textColor={colors.text}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleSendMessage()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Routine Generator Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text }]}>
            ✨ AI Routine Generator
          </Text>
          <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
            Enter your main goal, and AI will construct a custom habit routine!
          </Text>

          <TextInput
            mode="outlined"
            placeholder="e.g. Get fit, Study 2 hours daily, Better sleep"
            value={goalInput}
            onChangeText={setGoalInput}
            style={[styles.modalInput, { backgroundColor: colors.inputBg }]}
            outlineColor={colors.cardBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.text}
          />

          <Button
            mode="contained"
            onPress={handleGenerateRoutine}
            loading={generatingRoutine}
            disabled={!goalInput.trim() || generatingRoutine}
            style={[styles.modalGenBtn, { backgroundColor: colors.primary }]}
          >
            Generate AI Routine 🚀
          </Button>

          {/* Generated Habits Preview */}
          {generatedHabits.length > 0 && (
            <View style={styles.previewContainer}>
              <Text style={[styles.previewTitle, { color: colors.text }]}>Generated Habits:</Text>
              {generatedHabits.map((h, i) => (
                <View key={i} style={[styles.habitPreviewRow, { backgroundColor: colors.surfaceVariant }]}>
                  <MaterialCommunityIcons name={(h.icon as any) || 'star'} size={20} color={h.color || colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.habitPreviewName, { color: colors.text }]}>{h.title}</Text>
                    <Text style={[styles.habitPreviewSub, { color: colors.textSecondary }]}>
                      {h.targetCount} {h.unit} • {h.reminderTime || '08:00'}
                    </Text>
                  </View>
                </View>
              ))}

              <Button
                mode="contained"
                onPress={handleImportAllHabits}
                style={[styles.importBtn, { backgroundColor: colors.accent }]}
              >
                Import All Habits 📥
              </Button>
            </View>
          )}
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  generateBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  chipScrollView: {
    marginBottom: 6,
  },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatScrollContent: {
    paddingVertical: 10,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 2,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  loadingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 46,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 20,
    margin: 18,
    borderRadius: 22,
    borderWidth: 1,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    marginBottom: 14,
  },
  modalInput: {
    marginBottom: 12,
  },
  modalGenBtn: {
    borderRadius: 14,
  },
  previewContainer: {
    marginTop: 14,
    gap: 8,
  },
  previewTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  habitPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
  },
  habitPreviewName: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  habitPreviewSub: {
    fontSize: 11,
  },
  importBtn: {
    marginTop: 8,
    borderRadius: 14,
  },
});
