// src/hooks/useGemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

type ProjectInfo = {
  title: string;
  description: string;
  problem: string;
  targetAudience: string;
  tags: string[];
};

type PitchParams = {
  audience: string;
  venue: string;
  goal: string;
  duration: string;
};

export async function generateElevatorPitch(
  project: ProjectInfo,
  params: PitchParams
): Promise<string> {
  const prompt = `
You are helping a founder create a ${params.duration}-minute pitch for their startup.

Details:
- Title: ${project.title}
- Description: ${project.description}
- Problem: ${project.problem}
- Target Audience: ${project.targetAudience}
- Tags: ${project.tags.join(', ')}

Pitch Setting:
- Audience: ${params.audience}
- Venue: ${params.venue}
- Goal: ${params.goal}

Return a professional, persuasive pitch tailored for this setting.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating elevator pitch:", error);
    return "Failed to generate elevator pitch.";
  }
}

export async function generateProjectUpdates(project: {
  title: string;
  tags: string[];
}): Promise<string> {
  const prompt = `
Give 3 current startup updates related to these tags: ${project.tags.join(", ")}.
Include: industry insights, potential competitors, or market alerts.
Title: ${project.title}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating project updates:", error);
    return "Failed to fetch updates.";
  }
}
