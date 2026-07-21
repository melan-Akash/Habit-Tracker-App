import React, { useState } from 'react';
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
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare current history array for LLM memory
    const historyForLlm = messages.map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

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
      } else if (lowerQuery.includes('procrastinat')) {
        responseText = `To beat procrastination, try the **2-Minute Rule**: Commit to doing the task for just 2 minutes. Which habit are you currently postponing?`;
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
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
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
            <MaterialCommunityIcons name="auto-fix" size={18} color="#FFF" />
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

        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  { justifyContent: isAI ? 'flex-start' : 'flex-end' },
                ]}
              >
                {isAI && (
                  <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                    <MaterialCommunityIcons name="robot" size={20} color="#FFF" />
                  </View>
                )}

                <Surface
                  style={[
                    styles.messageBubble,
                    {
                      backgroundColor: isAI ? colors.card : colors.primary,
                      borderColor: isAI ? colors.cardBorder : colors.primary,
                      borderWidth: isAI ? 1 : 0,
                    },
                  ]}
                >
                  <Text style={[styles.messageText, { color: isAI ? colors.text : '#FFF' }]}>
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      { color: isAI ? colors.textSecondary : 'rgba(255,255,255,0.7)' },
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
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Llama 3.1 70B is thinking...
              </Text>
            </View>
          )}
        </View>
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
                      {h.targetCount} {h.unit} • {h.timeOfDay}
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
  contentContainer: {
    padding: 18,
    paddingTop: 54,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generateBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  chipScrollView: {
    marginBottom: 16,
  },
  promptChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 10,
  },
  promptChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chatContainer: {
    gap: 14,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 14,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  loadingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 22,
    margin: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 14,
  },
  modalGenBtn: {
    borderRadius: 14,
  },
  previewContainer: {
    marginTop: 18,
    gap: 8,
  },
  previewTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
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
    marginTop: 10,
    borderRadius: 14,
  },
});
