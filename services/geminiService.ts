import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPilotEvaluation = async (score: number, durationSeconds: number): Promise<AIAnalysis> => {
  try {
    const prompt = `
      The player just finished a round of a retro airplane shooter game.
      Score: ${score} points.
      Survival Time: ${durationSeconds} seconds.
      
      Provide a military-style rank (e.g., Cadet, Ace, Legend, Space Garbage) based on performance,
      and a short, witty, 1-sentence comment about their piloting skills.
      Be funny or encouraging.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rank: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["rank", "message"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysis;

  } catch (error) {
    console.error("AI Evaluation failed:", error);
    return {
      rank: "Unknown Pilot",
      message: "Comms system offline. Good flying though!"
    };
  }
};
