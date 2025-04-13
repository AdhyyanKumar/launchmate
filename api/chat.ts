// /api/chat.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  // Log everything
  console.log("=== Gemini AI Chat Debug ===");
  console.log("Incoming message:", message);
  console.log("API Key exists:", Boolean(apiKey));
  console.log("Full request body:", req.body);
  console.log("============================");

  if (!apiKey) {
    return res.status(500).json({ error: "Missing Gemini API Key on server" });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: "Invalid or empty message" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(message);
    const reply = result.response.text();

    console.log("Gemini reply:", reply);

    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("Gemini error:", err?.response || err);
    return res.status(500).json({ error: err.message || "Gemini call failed" });
  }
}
