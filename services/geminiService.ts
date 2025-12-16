import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Candidate } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash"; // Fast and efficient for text tasks

export const generateCandidateAnalysis = async (candidate: Candidate): Promise<string> => {
  try {
    const prompt = `
      You are an expert HR AI Analyst for Nexus Horizon HRMS.
      Analyze the following candidate profile for the role of ${candidate.role}.
      
      Candidate Data:
      Name: ${candidate.name}
      Experience: ${candidate.experience} years
      Skills: ${candidate.skills.join(", ")}
      Bio: ${candidate.bio}
      
      Please provide:
      1. A brief executive summary (max 50 words).
      2. Top 3 Strengths.
      3. Potential areas for development or interview questions to ask.
      4. A predicted "Success Score" (0-100) based on the profile match.
      
      Format the output as Markdown.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error analyzing candidate. Please check API Key configuration.";
  }
};

export const chatWithHRBot = async (message: string, context?: string): Promise<string> => {
  try {
    const systemInstruction = `
      You are "Horizon AI", the intelligent assistant for Nexus Horizon HRMS.
      Your tone is professional, empathetic, and strategic.
      You help HR professionals with tasks like drafting emails, analyzing trends, and suggesting policy.
      Keep answers concise (under 150 words) unless asked for detail.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: message + (context ? `\nContext: ${context}` : ""),
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "I'm thinking...";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I encountered an error connecting to the AI service.";
  }
};

export const getSmartSearchSuggestions = async (query: string): Promise<string[]> => {
    // A simplified example of using AI to interpret vague search queries
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Interpret this HR search query: "${query}". Return a JSON array of 3 specific search terms or module names that might be relevant.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        const text = response.text;
        if(text) return JSON.parse(text);
        return [];
    } catch (e) {
        return [];
    }
}
