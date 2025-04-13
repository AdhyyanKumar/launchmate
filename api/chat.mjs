// FILE: api/chat.mjs
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
    }


  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Gemini replied with:", text);
    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({ error: "Chatbot failure" });
  }
}
