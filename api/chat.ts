// /api/chat.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const message = req.body?.message;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(message);
    const reply = result.response.text();
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Gemini chat error:", error);
    return res.status(500).json({ error: 'Gemini failed' });
  }
}