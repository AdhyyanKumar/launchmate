// /api/chat.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buffers = await new Promise<Buffer>((resolve, reject) => {
        const chunks: any[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
      });
      const body = JSON.parse(buffers.toString());
      const message = body.message;      
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    console.log("🌐 Request Received");
    console.log("👉 API KEY EXISTS:", !!apiKey);
    console.log("👉 Incoming message:", message);

    if (!apiKey) {
      return res.status(500).json({ error: "Missing Gemini API key" });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: "Message is missing or not a string" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(message);
    const reply = result.response.text();

    console.log("✅ Gemini raw response:", result.response);
    console.log("✅ Extracted reply:", reply);

    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("💥 ERROR in /api/chat:", err?.message || err);
    console.error("💥 STACK TRACE:", err?.stack);
    return res.status(500).json({ error: "Internal server error", message: err?.message });
  }
}
