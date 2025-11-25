import { GoogleGenAI } from "@google/genai";
import { SessionData } from "../types";

// ============================================================================
// API KEY CONFIGURATION
// ============================================================================
// Please paste your Gemini API key between the quotes below.
// Example: const API_KEY = "AIzaSy...";
// You can obtain a key from: https://aistudio.google.com/app/apikey
const API_KEY = "AIzaSyAWHL01YKsxBnoEqJcrkU6vL7al6UPU69I"; 
// ============================================================================

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
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

    // Construct a structured prompt based on the new specific requirements
    const prompt = `
      You are Dan, an expert executive coach. 
      Write a session summary email to my coachee, ${data.coacheeName || 'Friend'}.
      
      TONE: Casual, warm, and encouraging.
      
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
      4. Summary: "We explored..." (Summarize the important points of the conversation).
      5. "Action Plan:" (List the action steps EXACTLY as they appear in the data above. Do not summarize them).
      6. "Takeaway:" (The Key Insight EXACTLY as written above).
      7. "Prayer Point:" (Rephrase the prayer point to start with something like "I'll be praying about...").
      8. "Next Meeting:" "Next meeting is in the calendar for ${data.extend.nextMeeting || '[Date]'}."
      9. Closing: "Cheering you on,\nDan"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary. Please check your API key configuration in services/geminiService.ts.";
  }
};

export const generateReflectiveQuestion = async (exploreNotes: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    const prompt = `
      I am a coach. Based on these notes from a coachee conversation, suggest ONE powerful, open-ended reflective question I should ask them to deepen their thinking.
      
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