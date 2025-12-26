
import { GoogleGenAI, Type } from "@google/genai";
import { FreshnessLevel } from "../types";

// NOTE: In a real production app, this should be proxied through a backend
// to protect the API key. For this demo, we use it client-side.
// Safe API Key retrieval for browser environment
const getApiKey = () => {
  try {
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  } catch (e) {
    return '';
  }
}

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const predictFreshness = async (
  foodName: string,
  foodType: string,
  timePrepared: string,
  storageTemp: string
): Promise<FreshnessLevel> => {
  if (!apiKey) {
    console.warn("No API Key available for Gemini.");
    return FreshnessLevel.UNKNOWN;
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Act as a food safety expert AI using Logistic Regression principles logic.
      Analyze the following food item details and classify its freshness.
      
      Details:
      - Food Name: ${foodName}
      - Food Type: ${foodType}
      - Time Prepared: ${timePrepared}
      - Storage Temperature: ${storageTemp}°C
      
      Rules:
      - "Fresh": Safe to eat, prepared recently, stored correctly.
      - "Risky": Edible but borderline, or stored at suboptimal temps for too long.
      - "Not Fresh": Dangerous, prepared too long ago, or bad storage.
      
      Return ONLY the JSON object matching this schema.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: {
              type: Type.STRING,
              enum: [FreshnessLevel.FRESH, FreshnessLevel.RISKY, FreshnessLevel.NOT_FRESH]
            },
            reasoning: {
              type: Type.STRING
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result.prediction as FreshnessLevel;

  } catch (error) {
    console.error("Gemini Freshness Prediction Failed:", error);
    return FreshnessLevel.UNKNOWN;
  }
};