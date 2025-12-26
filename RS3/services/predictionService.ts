import { FreshnessLevel } from "../types";
import { GoogleGenAI, Type } from "@google/genai";

// Safe API Key retrieval
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
  timeRange: string,
  storageMethod: string,
  hasVisibleIssues: string
): Promise<FreshnessLevel> => {
  
  // 1. Immediate Disqualification Rule
  if (hasVisibleIssues === 'Yes') {
    console.log("Prediction: Visible issues reported. Mark as NOT FRESH.");
    return FreshnessLevel.NOT_FRESH;
  }

  // 2. Client-Side Fallback (Rule-based)
  // Used if API fails or for immediate feedback
  const fallbackPrediction = (): FreshnessLevel => {
    // Room Temp Logic
    if (storageMethod === 'Room Temperature') {
      if (['<1 hr', '1–2 hrs', '2–4 hrs'].includes(timeRange)) return FreshnessLevel.FRESH;
      if (timeRange === '4–6 hrs') return FreshnessLevel.RISKY;
      return FreshnessLevel.NOT_FRESH; // >6 hrs
    }

    // Hot Pack Logic (Bacteria grows if temp drops over time)
    if (storageMethod === 'Hot Pack') {
      if (['<1 hr', '1–2 hrs', '2–4 hrs'].includes(timeRange)) return FreshnessLevel.FRESH;
      if (timeRange === '4–6 hrs') return FreshnessLevel.RISKY;
      return FreshnessLevel.NOT_FRESH;
    }

    // Fridge Logic
    if (storageMethod === 'Fridge') {
      if (timeRange === '>6 hrs') return FreshnessLevel.RISKY; // Just to be safe for donation
      return FreshnessLevel.FRESH;
    }

    return FreshnessLevel.UNKNOWN;
  };

  if (!apiKey) {
    console.warn("No API Key available for Gemini. Using fallback.");
    return fallbackPrediction();
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Act as a food safety expert. Classify freshness based on these simple inputs.
      
      Details:
      - Food: ${foodName} (${foodType})
      - Cooked: ${timeRange} ago
      - Stored in: ${storageMethod}
      - Visible Issues: ${hasVisibleIssues}
      
      Rules:
      - "Fresh": Safe to eat.
      - "Risky": Edible but borderline (e.g., room temp for 4+ hours).
      - "Not Fresh": Dangerous (e.g., >6 hours room temp, or visible issues).
      
      Return JSON schema.
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
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result.prediction as FreshnessLevel;

  } catch (error) {
    console.error("Gemini Prediction Failed:", error);
    return fallbackPrediction();
  }
};