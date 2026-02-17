import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCreativeContent = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, creative, and interesting piece of text for a QR code based on this topic: "${prompt}". 
      Keep it under 200 characters to ensure the QR code remains scannable. 
      If the user asks for a joke, poem, or message, provide that directly.
      Do not include markdown or quotes around the output.`,
    });
    
    return response.text?.trim() || "The moon is silent today.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to commune with the moon. Please try again.";
  }
};