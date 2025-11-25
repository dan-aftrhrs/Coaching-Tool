import { GoogleGenAI } from "@google/genai";
import { SessionData } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateBriefSummary = async (data: SessionData): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Check if there is enough data to summarize
    const hasData = data.engage.wins || data.explore.conversationNotes || data.extend.keyInsight;
    if (!hasData) return "No notes recorded.";

    const prompt = `
      Analyze the following coaching session notes and provide a summary in LESS THAN 30 WORDS.
      Focus on the key breakthrough or main theme.
      Do NOT list the action steps in this summary, just the core insight or win.
      
      Wins: ${data.engage.wins}
      Notes: ${data.explore.conversationNotes}
      Key Insight: ${data.extend.keyInsight}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Session completed.";
  } catch (error) {
    console.error("Error generating brief summary:", error);
    return "Session recorded.";
  }
};

export const generateSessionSummary = async (data: SessionData): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const actionStepsList = data.express.actionSteps
      .filter(step => step.trim().length > 0)
      .map((step, index) => `${index + 1}. ${step}`)
      .join('\n');

    // Construct a structured prompt from the session data
    const prompt = `
      You are Dan, an expert executive coach. 
      Write a session summary email to my client, ${data.clientName || 'Friend'}.
      
      The tone should be: Casual, warm, and encouraging.
      
      DATA FROM SESSION:
      - Client Vision: ${data.profile.vision}
      - Client I AMs: ${data.profile.iamStatements}
      
      - Wins/Goodness: ${data.engage.goodnessOfGod} / ${data.engage.wins}
      - Learning: ${data.engage.learning}
      
      - CONVERSATION NOTES (Use direct quotes if possible): 
        "${data.explore.conversationNotes}"
      
      - ACTION PLAN:
        ${actionStepsList || "No specific steps recorded."}
      
      - KEY INSIGHT (Takeaway): ${data.extend.keyInsight}
      - PRAYER POINT: ${data.extend.prayerPoint}
      - NEXT MEETING: ${data.extend.nextMeeting}
      
      - ENCOURAGEMENT FROM DAN: ${data.express.encouragement}

      EMAIL STRUCTURE:
      1. Salutation: "Hello ${data.clientName || 'there'},"
      2. Opening: "It was good to chat with you! Here are your notes from our session." (Casual tone).
      3. Summary of Notes: Summarize what we discussed, but strictly include 2-3 direct quotes from the conversation notes provided above to make it personal.
      4. "Here is your Action Plan:" (List the steps clearly).
      5. "Takeaway:" (The Key Insight).
      6. "Prayer Point:" (The Prayer Point).
      7. "Next Meeting:" (The Next Meeting time).
      8. Closing: "Cheering you on,\nDan"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary. Please check your API key.";
  }
};

export const generateReflectiveQuestion = async (exploreNotes: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const prompt = `
      I am a coach. Based on these notes from a client conversation, suggest ONE powerful, open-ended reflective question I should ask them to deepen their thinking.
      
      Conversation Notes:
      "${exploreNotes}"
      
      The question should be short, profound, and challenge them to think about the root cause or their future vision.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "What is the most important thing for you to focus on right now?";
  } catch (error) {
    console.error("Error generating question:", error);
    return "What would success look like for you in this situation?";
  }
};