const OpenAI = require('openai');

const generateBio = async (req, res) => {
  try {
    const { skills, name } = req.body;
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills array required' });
    }
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    const skillsStr = skills.join(', ') || 'general development';
    const userName = name || 'the developer';
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Generate a short professional developer bio for ${userName}, who is a skilled developer specializing in ${skillsStr}. The bio should mention their focus on creating innovative applications, their passion for delivering seamless user experiences, and their commitment to staying at the forefront of technology trends. Keep it to 2-3 sentences and make it professional and engaging.`,
        },
      ],
    });
    const bio = completion.choices[0]?.message?.content?.trim() || '';
    res.json({ bio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateBio };
