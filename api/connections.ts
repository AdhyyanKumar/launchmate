import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, tags, description, problem, targetAudience } = req.body;

    const prompt = `
You are helping a founder make meaningful startup connections.

The founder's project is called "${title}" and focuses on the following:
- Description: ${description}
- Problem: ${problem}
- Target Audience: ${targetAudience}
- Industry Tags: ${tags.join(', ')}

Based on this, list 3 **real or realistic** individuals in or near College Park, Maryland who have started small businesses in a similar or relevant space.

Return only a JSON array in this format:
[
  {
    "name": "Full Name",
    "role": "Their role or business",
    "info": "Short bio or summary of what they do",
    "relevance": "Explain how this person or business is relevant to the project above"
  }
]

No extra commentary or formatting. Only valid JSON.
`;

    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);

    const raw = result.response.text();
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]") + 1;
    const jsonText = raw.slice(start, end);

    try {
      const connections = JSON.parse(jsonText);
      return res.status(200).json({ connections });
    } catch (err) {
      console.error("Failed to parse Gemini JSON:", jsonText);
      return res.status(500).json({ error: "Invalid JSON from Gemini" });
    }
  } catch (err) {
    console.error("Gemini Connections API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
