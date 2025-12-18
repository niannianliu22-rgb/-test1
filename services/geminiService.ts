import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are an expert Education Consultant for "Ultimate Essay" (极致Essay), a premier tutoring agency for international students.
Your goal is to assist students who are interested in the "Trial Tutoring Session" (试听课).

Key Product Info:
- Product: 1v1 Guaranteed Pass Tutoring Trial Session (1v1 包过辅导试听课) (45 mins).
- Original Price: 1099 RMB.
- Group Buy Price: 699 RMB (Requires 3 people to form a group).
- Scope: Covers all majors (Business, CS, Engineering, Humanities, etc.).
- Value: Personalized diagnosis of academic weaknesses, essay planning, or exam prep strategy.

Tone: Professional, encouraging, empathetic, and persuasive. Use emojis occasionally.
Language: Chinese (Mandarin).

If a user asks about the price, emphasize the huge discount of the group buy (699 vs 1099).
If a user asks about quality, mention our mentors are from Top 30 global universities.
`;

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API Key missing");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const sendMessageToAI = async (message: string, history: { role: string; parts: { text: string }[] }[]): Promise<string> => {
  const client = getClient();
  if (!client) return "配置错误：缺少 API Key。";

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({
          role: h.role,
          parts: h.parts
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "抱歉，我暂时无法回答这个问题，请联系人工客服。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "网络连接异常，请稍后再试。";
  }
};