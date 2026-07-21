const Habit = require('../models/Habit');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper function to call OpenRouter API
const callOpenRouter = async (messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.includes('your_openrouter_api_key')) {
    console.log('⚠️ OpenRouter API Key not configured. Using Fallback Smart AI response.');
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
        model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free',
        messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    return null;
  } catch (error) {
    console.error('🔴 OpenRouter API Call Error:', error.message);
    return null;
  }
};

// @desc    Chat with AI Habit Coach
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithCoach = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Please provide a message' });
    }

    // Fetch user's habits for context
    const habits = await Habit.find({ user: req.user.id });
    const habitsSummary = habits.map(h => `${h.title} (${h.category}) - ${h.currentStreak}d streak`).join(', ');

    const systemPrompt = `You are an elite, empathetic, and highly motivating AI Habit Coach. 
The user currently tracks the following habits: ${habitsSummary || 'No habits added yet'}.
Provide short, actionable, inspiring advice with emojis to help them stay consistent. Keep responses under 150 words.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const aiResponse = await callOpenRouter(messages);

    if (aiResponse) {
      return res.status(200).json({ success: true, reply: aiResponse });
    }

    // Smart Fallback Response if OpenRouter API Key is not set or rate-limited
    const fallbackReplies = [
      `That's a great goal! 🚀 To build consistency with "${message}", start small—just 5 minutes a day! Would you like me to generate a 7-day routine for you?`,
      `Awesome question! 💡 Remember that motivation comes after taking the first small action. Focus on your 5-day streak and celebrate small wins! 🔥`,
      `Great progress! 🌟 Try attaching this new habit to an existing routine (Habit Stacking). For example: "After morning coffee, I will meditate for 5 minutes." ☕🧘`,
    ];

    const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

    res.status(200).json({
      success: true,
      reply,
      note: 'Using Smart Fallback AI. Add your OPENROUTER_API_KEY in server/.env for live LLM models!',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Generate Personalised AI Routine / Habits
// @route   POST /api/ai/generate-routine
// @access  Private
exports.generateRoutine = async (req, res) => {
  try {
    const { goal } = req.body; // e.g. "I want to get fit and eat healthy"

    const systemPrompt = `You are an expert Habit Designer. The user wants to achieve this goal: "${goal || 'Improve productivity and wellness'}".
Generate 4 recommended habits in JSON format.
Output ONLY raw JSON with this exact array structure:
[
  {
    "title": "Habit Title",
    "description": "Short description",
    "category": "fitness" (must be one of: fitness, mind, health, learning, work, creativity),
    "targetCount": 10,
    "unit": "mins",
    "frequency": "daily",
    "color": "#8C7CFF",
    "icon": "dumbbell"
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
          const generatedHabits = JSON.parse(jsonMatch[0]);
          return res.status(200).json({ success: true, habits: generatedHabits });
        }
      } catch (err) {
        console.log('JSON Parse failed, returning fallback');
      }
    }

    // Fallback AI Routine
    const fallbackRoutines = [
      {
        title: 'Morning Power Workout',
        description: '20 mins pushups & squats to boost energy',
        category: 'fitness',
        targetCount: 20,
        unit: 'mins',
        frequency: 'daily',
        color: '#FF5252',
        icon: 'dumbbell',
      },
      {
        title: 'Mindful Breathing',
        description: '10 mins meditation for stress relief',
        category: 'mind',
        targetCount: 10,
        unit: 'mins',
        frequency: 'daily',
        color: '#8C7CFF',
        icon: 'meditation',
      },
      {
        title: 'Hydration Reset',
        description: 'Drink 2.5L water daily for peak focus',
        category: 'health',
        targetCount: 2.5,
        unit: 'liters',
        frequency: 'daily',
        color: '#00E676',
        icon: 'water-outline',
      },
      {
        title: 'Deep Focus Reading',
        description: 'Read 15 pages of self-growth book',
        category: 'learning',
        targetCount: 15,
        unit: 'pages',
        frequency: 'daily',
        color: '#FFB74D',
        icon: 'book-open-variant',
      },
    ];

    res.status(200).json({ success: true, habits: fallbackRoutines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
