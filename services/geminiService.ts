
import { GoogleGenAI } from "@google/genai";

export const analyzeProductionData = async (orders: any[]) => {
  // Safe access to process.env to prevent ReferenceError in browser
  const env = (globalThis as any).process?.env || {};
  const apiKey = env.API_KEY;

  if (!apiKey || apiKey === 'undefined') {
    console.warn("Gemini API Key is missing. Analysis skipped.");
    return null;
  }

  try {
    // Instantiate exactly as required by guidelines
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Analyze the following sweater manufacturing production data and provide a brief executive summary:
      ${JSON.stringify(orders)}
      
      Format the response as JSON with these keys:
      - bottlenecks: string[] (List of departments causing delays)
      - efficiencyScore: number (0-100)
      - recommendations: string[] (Actionable steps to improve flow)
      - summary: string (Overall state of the factory)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    // Access .text property directly
    const text = response.text;
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", text);
      return null;
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
