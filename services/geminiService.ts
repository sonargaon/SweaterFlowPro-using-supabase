import { GoogleGenAI } from "@google/genai";

export const analyzeProductionData = async (orders: any[]) => {
  // Use process.env.API_KEY as per standard coding guidelines. 
  // It is shimmed in index.html for browser safety.
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.warn("Gemini API Key is not set in environment.");
    return null;
  }

  try {
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

    const text = response.text;
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Gemini JSON Parse Error:", text);
      return null;
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};