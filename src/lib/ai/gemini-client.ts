import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export { ai };

/** DB에 저장된 대화 기록을 Gemini API 형식으로 변환 */
export function toGeminiContents(
  messages: { role: string; content: string }[]
) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}
