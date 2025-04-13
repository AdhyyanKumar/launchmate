import { type VercelRequest, type VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // manually parse JSON body from buffer
  const body = await new Promise<string>((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const message = parsed.message;
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Empty message' });
  }

  const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  try {
    const result = await model.generateContent(message);
    const reply = result.response.text();
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('❌ Gemini error:', error);
    return res.status(500).json({ error: 'Gemini failed' });
  }
}
