const Habit = require('../models/Habit');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-70b-instruct';

// Helper function to call OpenRouter API (Meta Llama 3.1 70B Instruct)
const callOpenRouter = async (messages) => {
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
        temperature: 0.7,
        max_tokens: 500,
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

// @desc    Chat with AI Habit Coach (Powered by Llama 3.1 70B)
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithCoach = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Please provide a message' });
    }

    const habits = await Habit.find({ user: req.user.id });
    const habitsSummary = habits.map(h => `${h.title} (${h.category}) - ${h.currentStreak}d streak`).join(', ');

    const systemPrompt = `You are an elite, empathetic, and highly motivating AI Habit Coach powered by Llama 3.1 70B. 
The user currently tracks these habits: ${habitsSummary || 'No habits added yet'}.
Provide short, actionable, inspiring advice with emojis to help them build lasting discipline. Keep responses under 150 words.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const aiResponse = await callOpenRouter(messages);

    if (aiResponse) {
      return res.status(200).json({
        success: true,
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        reply: aiResponse,
      });
    }

    // Fallback AI response
    const fallbackReplies = [
      `That's a fantastic habit goal! 🚀 Using small daily steps with Meta Llama 3.1 70B AI guidance, you can build consistency. Start with just 5 minutes today! 🔥`,
      `Awesome effort! 💡 Remember: Motivation gets you started, but habit keeps you going. Stick to your active streak and celebrate every win! 🏆`,
      `Great progress! 🌟 Try Habit Stacking: attach this new goal immediately after an established routine like your morning coffee or workout! ☕🧘`,
    ];

    const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

    res.status(200).json({
      success: true,
      model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
      reply,
      note: 'Using Smart Fallback AI. Add your OPENROUTER_API_KEY in server/.env to activate live Llama 3.1 70B!',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Generate Personalised AI Routine (Powered by Llama 3.1 70B)
// @route   POST /api/ai/generate-routine
// @access  Private
exports.generateRoutine = async (req, res) => {
  try {
    const { goal } = req.body;

    const systemPrompt = `You are an expert Habit Designer. The user wants to achieve this goal: "${goal || 'Improve health and focus'}".
Generate 3-4 recommended habits in JSON format.
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
        console.log('JSON parse error, using fallback');
      }
    }

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
    ];

    res.status(200).json({ success: true, habits: fallbackRoutines });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
