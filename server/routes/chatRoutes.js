const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

const assistantInstructions = `
You are Vyntra's shopping assistant.
Help users with:
- finding products by category, style, or use case
- sizing guidance
- gift suggestions
- product and order-related questions at a high level

Keep answers short, practical, and friendly.
If you do not know exact store inventory, say so clearly and give the best next suggestion.
Do not invent policies, stock numbers, or order statuses.
`;

router.post('/', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ message: 'Chat assistant is not configured' });
    }

    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Messages are required' });
    }

    const recentMessages = messages
      .filter((message) => message && typeof message.content === 'string' && typeof message.role === 'string')
      .slice(-8)
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content.trim().slice(0, 1500)
      }))
      .filter((message) => message.content);

    if (recentMessages.length === 0) {
      return res.status(400).json({ message: 'Valid messages are required' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      instructions: assistantInstructions,
      input: recentMessages.map((message) => ({
        role: message.role,
        content: [{ type: 'input_text', text: message.content }]
      })),
      max_output_tokens: 300
    });

    const reply = response.output_text?.trim();

    if (!reply) {
      return res.status(502).json({ message: 'Assistant returned an empty response' });
    }

    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to generate response' });
  }
});

module.exports = router;
