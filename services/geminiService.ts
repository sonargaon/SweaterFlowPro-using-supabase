
import { GoogleGenAI } from "@google/genai";

// Initialize with exclusively from process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProductionData = async (orders: any[]) => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    console.warn("Gemini API Key is missing. Analysis skipped.");
    return null;
  }

  const prompt = `
    Analyze the following sweater manufacturing production data and provide a brief executive summary:
    ${JSON.stringify(orders)}
    
    Format the response as JSON with these keys:
    - bottlenecks: string[] (List of departments causing delays)
    - efficiencyScore: number (0-100)
    - recommendations: string[] (Actionable steps to improve flow)
    - summary: string (Overall state of the factory)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    // Access .text property directly
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
