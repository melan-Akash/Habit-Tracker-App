const Habit = require('../models/Habit');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-70b-instruct';

const callOpenRouter = async (messages, maxTokens = 600, temperature = 0.7) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.includes('your_openrouter_api_key')) {
    console.log('⚠️ OpenRouter API Key not configured in .env. Using Smart Fallback AI.');
    return null;
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://habittracker.app',
        'X-Title': 'Habit Tracker AI Coach',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    if (data.error) {
      console.error('🔴 OpenRouter API Error:', data.error.message || data.error);
    }
    return null;
  } catch (error) {
    console.error('🔴 OpenRouter Connection Error:', error.message);
    return null;
  }
};

// @desc    Interactive Multi-turn Chat with AI Habit Coach
// @route   POST /api/ai/chat
exports.chatWithCoach = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Please provide a message' });
    }

    const lowerMsg = message.trim().toLowerCase();

    // 1. Casual Greetings
    const isGreeting = ['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'hola', 'sup', 'watsup', 'good morning', 'good evening', 'how are you'].includes(lowerMsg);

    if (isGreeting) {
      const greetingReplies = [
        `Hey there! 👋 I'm Nova, your AI Habit Coach powered by Llama 3.1 70B! What specific habit or goal are you working on today? 🚀`,
        `Hello! 🌟 I'm doing great and ready to help you hit your goals! What area of your life would you like to improve today? (e.g. Health, Fitness, Study)`,
        `Hey! 👋 Excited to coach you today! What is the #1 habit you want to build or improve right now?`,
      ];
      return res.status(200).json({
        success: true,
        reply: greetingReplies[Math.floor(Math.random() * greetingReplies.length)],
      });
    }

    // 2. Capabilities & Info Questions
    if (
      lowerMsg.includes('what can you do') ||
      lowerMsg.includes('what you can do') ||
      lowerMsg.includes('who are you') ||
      lowerMsg.includes('help me') ||
      lowerMsg.includes('features')
    ) {
      return res.status(200).json({
        success: true,
        reply: `Here is what I can do for you as your AI Coach 🤖:\n\n1. 💬 **2-Way Coaching**: Have a real interactive conversation with me about your goals.\n2. ✨ **Generate Routines**: Tap **'AI Routine'** to create tailored habit plans.\n3. 📊 **Predict Risks**: Get consistency analysis on your Streaks screen.\n4. 🪄 **Magic Text Parser**: Auto-fill all habit fields on Add Habit screen!\n\nWhich of these would you like to try first?`,
      });
    }

    // 3. Construct Multi-turn Prompt
    const habits = req.user ? await Habit.find({ user: req.user.id }) : [];
    const habitsSummary = habits.map(h => `${h.title} (${h.category}) - ${h.currentStreak}d streak`).join(', ');

    const systemPrompt = `You are Nova, an elite, highly interactive AI Habit Coach powered by Llama 3.1 70B.
User's current habits in DB: ${habitsSummary || 'No habits added yet'}.

CRITICAL CONVERSATIONAL RULES:
1. Speak in a warm, encouraging, conversational human tone.
2. Directly reference and answer what the user just said or answered.
3. ALWAYS end your response with ONE clear, engaging follow-up question to keep the conversation going (e.g., "What time of day suits you best?", "Have you tried starting with 10 mins?", "What is your biggest obstacle?").
4. Keep responses concise and structured under 120 words with emojis.`;

    let messages = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(history) && history.length > 0) {
      history.forEach((h) => {
        if (h.role && h.content) {
          messages.push({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content,
          });
        }
      });
    }

    messages.push({ role: 'user', content: message });

    const aiResponse = await callOpenRouter(messages);

    if (aiResponse) {
      return res.status(200).json({ success: true, reply: aiResponse });
    }

    let reply = `That sounds like a great focus! 🚀 To make it stick, starting with a 5-minute daily commitment works wonders. What time of day would be easiest for you to do this habit? ⏰`;

    if (lowerMsg.includes('study') || lowerMsg.includes('read') || lowerMsg.includes('learn')) {
      reply = `Studying & reading regularly expands your mind! 📚 Have you tried using the **Pomodoro Technique** (25 mins study + 5 mins rest)? How many hours or pages are you aiming for daily?`;
    } else if (lowerMsg.includes('fit') || lowerMsg.includes('gym') || lowerMsg.includes('workout') || lowerMsg.includes('exercise')) {
      reply = `Fitness is an incredible energy booster! 🏋️‍♂️ Do you prefer morning or evening workouts, and what's your favorite exercise right now?`;
    } else if (lowerMsg.includes('water') || lowerMsg.includes('health') || lowerMsg.includes('sleep')) {
      reply = `Focusing on health & sleep gives you ultimate vitality! 💧😴 What time do you usually go to bed, and how many glasses of water do you drink a day?`;
    }

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Generate Routine
// @route   POST /api/ai/generate-routine
exports.generateRoutine = async (req, res) => {
  try {
    const { goal } = req.body;

    const systemPrompt = `You are an expert AI Habit Architect. User goal: "${goal || 'Improve health and focus'}".
Generate 3-4 habits in raw JSON format only:
[
  {
    "title": "Habit Title",
    "description": "Short description",
    "category": "fitness" (fitness, mind, health, learning, work, creativity),
    "targetCount": 10,
    "unit": "mins",
    "frequency": "daily",
    "color": "#8C7CFF",
    "icon": "dumbbell",
    "timeOfDay": "morning"
  }
]`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate habit routine for: ${goal}` },
    ];

    const aiResponse = await callOpenRouter(messages);

    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return res.status(200).json({ success: true, habits: JSON.parse(jsonMatch[0]) });
        }
      } catch (err) {
        console.log('JSON parse error, using fallback');
      }
    }

    res.status(200).json({
      success: true,
      habits: [
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
      ],
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    AI Performance Analysis
// @route   POST /api/ai/analyze-progress
exports.analyzeProgress = async (req, res) => {
  try {
    const habits = req.user ? await Habit.find({ user: req.user.id }) : [];

    if (habits.length === 0) {
      return res.status(200).json({
        success: true,
        score: 80,
        riskHabit: 'None',
        analysis: 'Add your first habit to receive deep AI performance analytics! 🚀',
        recommendation: 'Start with 1 daily habit like drinking water or 5-min reading.',
      });
    }

    const habitsData = habits.map(h => ({
      title: h.title,
      category: h.category,
      currentStreak: h.currentStreak,
      bestStreak: h.bestStreak,
      completedToday: h.completedToday,
    }));

    const systemPrompt = `Analyze user habits data: ${JSON.stringify(habitsData)}.
Return ONLY a valid JSON:
{
  "score": 88,
  "statusTitle": "Unstoppable Achiever",
  "riskHabit": "Habit Title at risk or None",
  "analysis": "Short 2-sentence summary",
  "recommendation": "One actionable tip"
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Analyze my habit performance' },
    ];

    const aiResponse = await callOpenRouter(messages);

    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return res.status(200).json({ success: true, ...JSON.parse(jsonMatch[0]) });
        }
      } catch (e) {
        console.log('Analysis JSON parse error');
      }
    }

    const totalStreaks = habits.reduce((acc, h) => acc + h.currentStreak, 0);
    const score = Math.min(98, Math.max(65, 70 + totalStreaks * 2));

    res.status(200).json({
      success: true,
      score,
      statusTitle: 'Consistent Performer ⚡',
      riskHabit: habits.find(h => !h.completedToday)?.title || 'None',
      analysis: `You have completed ${habits.filter(h => h.completedToday).length} of ${habits.length} habits today! Your total active streak is ${totalStreaks} days.`,
      recommendation: 'Complete your pending habits before 8 PM to maintain your flame streak! 🔥',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    AI Natural Language Text to Habit Parser
// @route   POST /api/ai/parse-text
exports.parseTextToHabit = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Please provide text input' });
    }

    const systemPrompt = `You are a Smart NLP Parser powered by Llama 3.1 70B.
Convert this user statement: "${text}" into a FULLY-FILLED Habit object in raw JSON format ONLY.
Every single field MUST be intelligently populated.
JSON structure:
{
  "title": "Clear Catchy Habit Name",
  "description": "Detailed habit description",
  "category": "fitness" (MUST be one of: fitness, mind, health, learning, work, creativity),
  "targetCount": 15 (number),
  "unit": "pages" (unit like mins, pages, liters, hours, entry, times),
  "frequency": "daily",
  "color": "#8C7CFF" (hex color code: fitness=#FF5252, mind=#8C7CFF, health=#00E676, learning=#FFB74D, work=#6C5CE7, creativity=#FF6584),
  "icon": "book-open-variant" (MaterialCommunityIcon name),
  "timeOfDay": "evening" (MUST be one of: morning, afternoon, evening, anytime)
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ];

    const aiResponse = await callOpenRouter(messages);

    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.status(200).json({ success: true, habit: parsed });
        }
      } catch (e) {
        console.log('Parse text JSON error');
      }
    }

    let category = 'fitness';
    let icon = 'dumbbell';
    let color = '#FF5252';
    let timeOfDay = 'anytime';
    let targetCount = 10;
    let unit = 'mins';

    const lowerText = text.toLowerCase();

    if (lowerText.includes('water') || lowerText.includes('drink') || lowerText.includes('eat') || lowerText.includes('health')) {
      category = 'health';
      icon = 'water-outline';
      color = '#00E676';
      targetCount = 2;
      unit = 'liters';
    } else if (lowerText.includes('read') || lowerText.includes('book') || lowerText.includes('study') || lowerText.includes('learn')) {
      category = 'learning';
      icon = 'book-open-variant';
      color = '#FFB74D';
      targetCount = 15;
      unit = 'pages';
    } else if (lowerText.includes('meditat') || lowerText.includes('mind') || lowerText.includes('peace') || lowerText.includes('journal')) {
      category = 'mind';
      icon = 'meditation';
      color = '#8C7CFF';
      targetCount = 10;
      unit = 'mins';
    } else if (lowerText.includes('code') || lowerText.includes('work') || lowerText.includes('project')) {
      category = 'work';
      icon = 'code-tags';
      color = '#6C5CE7';
      targetCount = 1;
      unit = 'hours';
    }

    if (lowerText.includes('morning') || lowerText.includes('bed') || lowerText.includes('wake')) {
      timeOfDay = 'morning';
    } else if (lowerText.includes('night') || lowerText.includes('sleep') || lowerText.includes('evening')) {
      timeOfDay = 'evening';
    } else if (lowerText.includes('afternoon')) {
      timeOfDay = 'afternoon';
    }

    res.status(200).json({
      success: true,
      habit: {
        title: text.length > 25 ? text.substring(0, 25) + '...' : text,
        description: `Daily practice of: ${text}`,
        category,
        targetCount,
        unit,
        frequency: 'daily',
        color,
        icon,
        timeOfDay,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    AI Habit Optimizer
// @route   POST /api/ai/optimize-habit
exports.optimizeHabit = async (req, res) => {
  try {
    const { habitTitle, category } = req.body;

    const systemPrompt = `Optimize habit: "${habitTitle}" (${category}) using Atomic Habits principles. Keep under 100 words in bullet points.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Optimize habit: ${habitTitle}` },
    ];

    const aiResponse = await callOpenRouter(messages);

    if (aiResponse) {
      return res.status(200).json({ success: true, tip: aiResponse });
    }

    res.status(200).json({
      success: true,
      tip: `💡 **Habit Stacking Tip for ${habitTitle}**:\n1. **Anchor Cue**: Do this right after morning coffee ☕\n2. **Make it Obvious**: Prepare your space the night before 🌙\n3. **Reward**: Give yourself a quick 5-sec celebration! 🎉`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
