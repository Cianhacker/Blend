import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Google Gen AI if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI:', err);
  }
}

// NPC AI Chat Endpoint
app.post('/api/npc-chat', async (req, res) => {
  try {
    const {
      npcName,
      npcRole,
      npcPersonality,
      npcMood,
      playerRole,
      playerName,
      playerReputation,
      currentFloor,
      playerMessage,
      actionContext,
    } = req.body;

    // Check if Gemini API is available
    if (process.env.GEMINI_API_KEY) {
      if (!aiClient) {
        aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      }

      const systemPrompt = `You are roleplaying as "${npcName}", a character in a high school 3D simulator game.
Your role: ${npcRole}
Your personality: ${npcPersonality}
Current mood: ${npcMood}
Location: Floor ${currentFloor} of the 12-floor high school.

The player speaking to you is:
Name: ${playerName || 'The Player'}
Role: ${playerRole}
Reputation: Nerd=${playerReputation?.nerd ?? 50}, Jock=${playerReputation?.jock ?? 50}, Rebel=${playerReputation?.rebel ?? 50}, Authority=${playerReputation?.authority ?? 50}.
Action context: ${actionContext || 'talking in hallway'}

Respond in 1-2 punchy, immersive sentences in character.
Do not break character. Do not use asterisks for actions. Only return your spoken dialogue.
If the player is friendly, respond accordingly. If they provoke or taunt you, react according to your role and mood (bullies get angry/threatening, teachers threaten detention, janitors complain about messes, students gossip or act scared/friendly).`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nPlayer says: "${playerMessage}"` }] },
        ],
      });

      const replyText = response.text?.trim();
      if (replyText) {
        return res.json({ reply: replyText, source: 'ai' });
      }
    }

    // Fallback if no API key or empty response
    return res.json({ reply: null, source: 'fallback' });
  } catch (error: any) {
    console.error('Error generating AI dialogue:', error?.message || error);
    return res.json({ reply: null, source: 'fallback', error: error?.message });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = Number(process.env.PORT) || 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`High School 3D server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
