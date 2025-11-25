import { GoogleGenAI } from "@google/genai";
import { SessionData } from "../types";

const getAIClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

export const generateBriefSummary = async (data: SessionData, apiKey: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";
  
  try {
    const ai = getAIClient(apiKey);
    
    // Check if there is enough data to summarise
    const hasData = data.engage.wins || data.explore.conversationNotes || data.extend.keyInsight;
    if (!hasData) return "No notes recorded.";

    const prompt = `
      Analyse the following coaching session notes and provide a summary in LESS THAN 30 WORDS.
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

export const generateSessionSummary = async (data: SessionData, apiKey: string): Promise<string> => {
  if (!apiKey) return "Please enter your Gemini API Key in the field provided in the Extend tab.";

  try {
    const ai = getAIClient(apiKey);
    
    const actionStepsList = data.express.actionSteps
      .filter(step => step.trim().length > 0)
      .map((step, index) => `${index + 1}. ${step}`)
      .join('\n');

    // Construct a structured prompt based on the new specific requirements
    const prompt = `
      You are Dan, an expert executive coach. 
      Write a session summary email to my coachee, ${data.coacheeName || 'Friend'}.
      
      TONE: Casual, warm, and encouraging. Use UK English spelling (e.g. realised, colour, programme, centre).
      
      DATA FROM SESSION:
      - Coachee Vision: ${data.profile.vision}
      - Coachee I AMs: ${data.profile.iamStatements}
      
      - Wins/Goodness: ${data.engage.goodnessOfGod} / ${data.engage.wins}
      - Learning: ${data.engage.learning}
      - Improvements/Struggles/Obstacles: ${data.engage.improvements} / ${data.express.obstacles}
      
      - CONVERSATION NOTES: 
        "${data.explore.conversationNotes}"
      
      - ACTION PLAN (Keep exactly as written):
        ${actionStepsList || "No specific steps recorded."}
      
      - KEY INSIGHT (Keep exactly as written): ${data.extend.keyInsight}
      - PRAYER POINT: ${data.extend.prayerPoint}
      - NEXT MEETING: ${data.extend.nextMeeting}
      
      - ENCOURAGEMENT FROM DAN: ${data.express.encouragement}

      EMAIL STRUCTURE:
      1. Salutation: "Hello ${data.coacheeName ? data.coacheeName.split(' ')[0] : 'there'},"
      2. Casual Opening: "It was good to chat with you! Here are some notes from our session."
      3. Encouragement: Write a short paragraph encouraging them on their breakthrough regarding their struggles. Explicitly mention some of the struggles or obstacles they overcame or are facing (from the data above).
      4. Summary: "We explored..." (Summarise the important points of the conversation).
      5. "Action Plan:" (List the action steps EXACTLY as they appear in the data above. Do not summarise them).
      6. "Takeaway:" (The Key Insight EXACTLY as written above).
      7. "Prayer Point:" (Rephrase the prayer point to start with something like "I'll be praying about...").
      8. "Next Meeting:" "Next meeting is in the calendar for ${data.extend.nextMeeting || '[Date]'}."
      9. Closing: "Cheering you on,\nDan"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    if (!response.text && response.candidates && response.candidates[0]) {
       return `AI Generation stopped. Reason: ${response.candidates[0].finishReason}. (Check if your notes trigger safety filters).`;
    }

    return response.text || "Unable to generate summary.";
  } catch (error: any) {
    console.error("Error generating summary:", error);
    const errorMessage = error.message || String(error);
    return `Error generating summary: ${errorMessage}\n\nPlease check that your API Key is valid and has access to gemini-2.5-flash.`;
  }
};

export const generateReflectiveQuestion = async (exploreNotes: string, apiKey: string): Promise<string> => {
  if (!apiKey) return "Add API Key for AI suggestions.";

  try {
    const ai = getAIClient(apiKey);
    
    const prompt = `
      I am a coach. Based on these notes from a coachee conversation, suggest ONE powerful, open-ended reflective question I should ask them to deepen their thinking.
      Use UK English spelling.
      
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