
import { GoogleGenAI } from "@google/genai";

// Initialize with named parameter as required by guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProductionData = async (orders: any[]) => {
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

    // Access .text property directly (not as a method)
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
