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

// @desc    Chat with AI Habit Coach
// @route   POST /api/ai/chat
exports.chatWithCoach = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Please provide a message' });
    }

    const lowerMsg = message.trim().toLowerCase();

    // 1. Casual Greetings
    const isGreeting = ['hi', 'hii', 'hiii', 'hello', 'hey', 'heyy', 'hola', 'sup', 'watsup', 'good morning', 'good evening', 'how are you'].includes(lowerMsg);

    if (isGreeting) {
      const greetingReplies = [
        `Hey there! 👋 I'm Nova, your AI Habit Coach powered by Llama 3.1 70B! How can I help you build your routine today?`,
        `Hello! 🌟 I'm feeling energized and ready to help you hit your streak goals! What's on your mind?`,
        `Hey! 👋 Ready to build great habits today? Ask me for advice or tap 'AI Routine' to generate a 3-habit plan! 🚀`,
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
        reply: `Here is what I can do for you as your AI Coach 🤖:\n\n1. 💬 **Answer Questions**: Ask me how to beat procrastination, improve sleep, or study effectively.\n2. ✨ **Generate Routines**: Tap **'AI Routine'** to create tailored habit plans for any goal.\n3. 📊 **Performance Analytics**: View AI Consistency Scores on your Streaks screen.\n4. 🪄 **Magic Text Parser**: Auto-fill habit fields by typing natural sentences on the Add Habit screen!`,
      });
    }

    // 3. Try Live OpenRouter API (Llama 3.1 70B)
    const habits = await Habit.find({ user: req.user.id });
    const habitsSummary = habits.map(h => `${h.title} (${h.category}) - ${h.currentStreak}d streak`).join(', ');

    const systemPrompt = `You are Nova, an elite, warm, encouraging AI Habit Coach powered by Llama 3.1 70B. 
User's current habits: ${habitsSummary || 'No habits added yet'}.
Provide short, actionable, inspiring advice with emojis. Keep responses friendly and under 120 words.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const aiResponse = await callOpenRouter(messages);

    if (aiResponse) {
      return res.status(200).json({ success: true, reply: aiResponse });
    }

    // 4. Intelligent Smart Fallback Replies (NO generic "consistency with X" template)
    let reply = `That's an inspiring focus! 🚀 Small daily consistency is the secret to big wins. Start with just 5-10 minutes today and celebrate your streak! 🔥`;

    if (lowerMsg.includes('study') || lowerMsg.includes('read') || lowerMsg.includes('learn')) {
      reply = `To excel at study & learning 📚:\n• Use the **Pomodoro Technique** (25 mins focus + 5 mins break)\n• Set a fixed daily study slot\n• Keep your phone in another room! 💡`;
    } else if (lowerMsg.includes('fit') || lowerMsg.includes('gym') || lowerMsg.includes('workout') || lowerMsg.includes('exercise')) {
      reply = `Awesome fitness goal! 🏋️‍♂️ Consistency beats intensity. Start with a 15-min daily workout and track your flame streak! 🔥`;
    } else if (lowerMsg.includes('water') || lowerMsg.includes('health') || lowerMsg.includes('sleep')) {
      reply = `Hydration & Sleep setup 💧😴:\n• Keep a 1L water bottle at your desk\n• Drink 1 glass immediately after waking up\n• Avoid screens 30 mins before sleep!`;
    }

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. @desc    Generate Personalised AI Routine
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

// 3. @desc    AI Performance Analysis
// @route   POST /api/ai/analyze-progress
exports.analyzeProgress = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id });

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

// 4. @desc    AI Text Parser
// @route   POST /api/ai/parse-text
exports.parseTextToHabit = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Please provide text input' });
    }

    const systemPrompt = `Convert: "${text}" into JSON habit structure:
{
  "title": "Habit Title",
  "description": "Clear description",
  "category": "fitness" (fitness, mind, health, learning, work, creativity),
  "targetCount": 15,
  "unit": "pages",
  "frequency": "daily",
  "color": "#8C7CFF",
  "icon": "book-open-variant",
  "timeOfDay": "evening"
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
          return res.status(200).json({ success: true, habit: JSON.parse(jsonMatch[0]) });
        }
      } catch (e) {
        console.log('Parse text JSON error');
      }
    }

    res.status(200).json({
      success: true,
      habit: {
        title: text.substring(0, 30),
        description: text,
        category: 'fitness',
        targetCount: 10,
        unit: 'mins',
        frequency: 'daily',
        color: '#6C5CE7',
        icon: 'star',
        timeOfDay: 'anytime',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. @desc    AI Habit Optimizer
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
