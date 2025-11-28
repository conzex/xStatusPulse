import { GoogleGenAI } from "@google/genai";
import { IncidentStatus, IncidentUpdate } from "../types";

// Note: API_KEY is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getModel = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure the environment variable.");
  }
  // Upgraded to Gemini 3 Pro as requested for higher quality generation
  return 'gemini-3-pro-preview';
};

export const generateInitialIncidentReport = async (serviceName: string, issueDetails: string): Promise<string> => {
  try {
    const model = getModel();
    const prompt = `
      You are a Site Reliability Engineer (SRE). 
      Write a professional, calm, and reassuring public-facing incident status update for a new incident.
      Keep it concise (1-2 paragraphs).

      Service Name: ${serviceName}
      Issue Details: ${issueDetails}
      
      Start by acknowledging the issue and its impact.
      State that your team has begun investigating.
      Do not promise a specific resolution time.
      End with an assurance that you will provide updates as more information becomes available.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 250,
      }
    });

    return response.text || "Could not generate a response from the AI model.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Failed to generate incident report due to an API error: ${error.message}`;
  }
};

export const generateIncidentUpdate = async (
  incidentTitle: string,
  newStatus: IncidentStatus,
  previousUpdates: IncidentUpdate[]
): Promise<string> => {
  try {
    const model = getModel();
    const history = previousUpdates.map(u => `- ${u.createdAt.toISOString()}: [${u.status}] ${u.message}`).join('\n');
    const prompt = `
      You are an SRE communicating during an ongoing incident.
      Write a concise, professional follow-up update for the public status page.

      Incident Title: ${incidentTitle}
      
      Previous Updates:
      ${history}

      The new status is: ${newStatus.toUpperCase()}

      Based on the new status, draft a brief (1-2 paragraph) update.
      - If 'identified': State that the root cause has been found and what the team is doing to remediate it.
      - If 'monitoring': State that a fix has been applied and the team is monitoring the systems for stability.
      - If 'resolved': State that the issue is fully resolved, systems are back to normal, and apologize for the disruption. Mention that a post-mortem will follow.

      Maintain a calm and reassuring tone. Do not promise specific timelines.
    `;

     const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 300,
      }
    });

    return response.text || "Could not generate an update from the AI model.";

  } catch (error) {
     console.error("Gemini API Error:", error);
    return `Failed to generate incident update due to an API error: ${error.message}`;
  }
};


export const analyzeRootCause = async (logs: string): Promise<string> => {
  try {
     const model = getModel();
     const response = await ai.models.generateContent({
      model: model,
      contents: `Analyze these simulated server logs and identify the most likely root cause of the failure in one brief sentence. Be technical and specific. For example: "The root cause appears to be database connection pool exhaustion." or "A memory leak in the authentication service likely caused the outage."\n\nLogs:\n${logs}`,
    });
    return response.text || "No analysis available.";
  } catch (e) {
      console.error("Gemini Log Analysis Error:", e);
      return "Failed to analyze logs due to an API error.";
  }
}