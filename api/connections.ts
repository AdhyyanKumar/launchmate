import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, tags } = req.body;

  if (!title || !tags || !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Missing or invalid title/tags' });
  }

  try {
    console.log('🌐 Request to Gemini Connections API');
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const location = 'College Park, Maryland';
    const tagText = tags.join(', ');
    const prompt = `
List 3 real individuals who have created small businesses in ${location} related to: ${tagText}.
Only return individuals, not companies. For each, provide:
- Full name
- Business name
- A short, engaging bio (2-3 lines)

Make the format clean for web display and avoid generic filler.
    `;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    console.log('✅ Gemini reply for connections:', reply);
    res.status(200).json({ connections: reply });
  } catch (err) {
    console.error('Gemini API error (connections):', err);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
}
