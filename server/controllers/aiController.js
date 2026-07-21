const Habit = require('../models/Habit');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'meta-llama/llama-3.1-70b-instruct';

// Helper function to call OpenRouter API (Meta Llama 3.1 70B Instruct)
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

// 1. @desc    Chat with AI Habit Coach
// @route   POST /api/ai/chat
exports.chatWithCoach = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Please provide a message' });
    }

    const habits = await Habit.find({ user: req.user.id });
    const habitsSummary = habits.map(h => `${h.title} (${h.category}) - ${h.currentStreak}d streak`).join(', ');

    const systemPrompt = `You are an elite, empathetic, and world-class AI Habit & Performance Coach powered by Llama 3.1 70B. 
User's current habits: ${habitsSummary || 'No habits added yet'}.
Provide concise, highly actionable, inspiring advice with emojis. Keep responses under 150 words.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const aiResponse = await callOpenRouter(messages);

    if (aiResponse) {
      return res.status(200).json({ success: true, reply: aiResponse });
    }

    res.status(200).json({
      success: true,
      reply: `That's an inspiring goal! 🚀 To build consistency with "${message}", start small—just 5 minutes today. Focus on your active streaks and celebrate small wins! 🔥`,
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

    const systemPrompt = `You are an expert AI Habit Architect. The user wants to achieve: "${goal || 'Improve health and focus'}".
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

// 3. @desc    AI Performance Analysis & Risk Prediction
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

    const systemPrompt = `You are an AI Performance Analyst powered by Llama 3.1 70B.
Analyze the user's habits data: ${JSON.stringify(habitsData)}.
Return ONLY a valid JSON object in this format:
{
  "score": 88 (number between 0 and 100),
  "statusTitle": "Unstoppable Achiever" (short title),
  "riskHabit": "Habit Title at highest risk of breaking streak or None",
  "analysis": "Short 2-sentence summary of overall progress",
  "recommendation": "One actionable tip to boost consistency"
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

    // Fallback Analysis
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

// 4. @desc    AI Natural Language Text to Habit Parser
// @route   POST /api/ai/parse-text
exports.parseTextToHabit = async (req, res) => {
  try {
    const { text } = req.body; // e.g. "I want to read 15 pages every night before bed"

    if (!text) {
      return res.status(400).json({ success: false, error: 'Please provide text input' });
    }

    const systemPrompt = `You are a Smart NLP Parser. Convert this user statement: "${text}" into a structured Habit object.
Output ONLY raw JSON format:
{
  "title": "Habit Title",
  "description": "Clear description",
  "category": "fitness" (fitness, mind, health, learning, work, creativity),
  "targetCount": 15,
  "unit": "pages",
  "frequency": "daily",
  "color": "#8C7CFF",
  "icon": "book-open-variant",
  "timeOfDay": "evening" (morning, afternoon, evening, anytime)
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

    // Fallback parsing
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

// 5. @desc    AI Habit Stack & Optimization Strategy
// @route   POST /api/ai/optimize-habit
exports.optimizeHabit = async (req, res) => {
  try {
    const { habitTitle, category } = req.body;

    const systemPrompt = `You are a Habit Psychology Expert. The user wants to optimize their habit: "${habitTitle}" (${category}).
Provide 3 atomic habit optimization tips based on James Clear's Atomic Habits principles (Cue, Craving, Response, Reward).
Keep output under 100 words in friendly bullet points with emojis.`;

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
