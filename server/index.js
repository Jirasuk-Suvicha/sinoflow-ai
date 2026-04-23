const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `
Act as a patient and encouraging Chinese teacher for an absolute beginner. 
Your goal is to help them learn through conversation (Conversational Immersion).
Use simple HSK 1 vocabulary and short sentences.
Always provide Pinyin and English translation for your Chinese sentences.
If the user makes a mistake in Chinese, gently correct them and explain why.
Encourage the user to speak/type in Chinese.
Format:
Chinese: [Chinese characters]
Pinyin: [pinyin with tones]
English: [English translation]
Correction: [Optional correction if user made a mistake]
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Simple implementation: send the last message or the whole history
    // For MVP, we'll use the generative model directly
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    const chatHistory = messages.slice(0, -1)
      .filter((m, i) => !(i === 0 && m.role === 'ai')) // Remove initial AI greeting from history for Gemini
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = await result.response;
    const text = response.text();

    res.json({ content: text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
