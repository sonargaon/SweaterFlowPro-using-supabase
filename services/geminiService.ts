
import { GoogleGenAI } from "@google/genai";

// Fix: Directly initialized GoogleGenAI with process.env.API_KEY as per coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProductionData = async (orders: any[]) => {
  try {
    const prompt = `
      Analyze the following sweater manufacturing production data and provide a brief executive summary:
      ${JSON.stringify(orders)}
      
      Format the response as JSON with these keys:
      - bottlenecks: string[] (List of departments causing delays)
      - efficiencyScore: number (0-100)
      - recommendations: string[] (Actionable steps to improve flow)
      - summary: string (Overall state of the factory)
    `;

    // Fix: Using ai.models.generateContent directly with model and prompt string
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    // Fix: Accessing .text as a property (not a method) as per SDK specifications
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

export const analyzeStyleRisk = async (techPack: any) => {
  try {
    const prompt = `
      As a Senior Manufacturing Engineer, audit this sweater Tech-Pack for production risks:
      Style: ${techPack.styleNumber}
      Yarn: ${techPack.yarnType} (${techPack.yarnCount})
      Notes: ${techPack.constructionNotes}
      Costing Breakdown: $${techPack.totalCost}
      
      Analyze for:
      1. Material Compatibility (Yarn vs likely gauge)
      2. Bottleneck Prediction (Linking or Finishing complexity)
      3. Quality Risks
      
      Format response as JSON:
      - riskLevel: "Low" | "Medium" | "High"
      - riskScore: number (0-100)
      - technicalAlerts: string[]
      - mitigationSteps: string[]
    `;

    // Fix: Using ai.models.generateContent directly with model and contents
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    // Fix: Accessing .text property directly
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Risk Analysis Error:", error);
    return null;
  }
};
