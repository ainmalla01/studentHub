import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";
import { AppError } from "../utils/AppError.js";

let client = null;

/**
 * The AI client is created lazily so the API still boots when GEMINI_API_KEY is
 * not configured (the AI feature simply returns 503 in that case).
 */
export const getAiClient = () => {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(503, "AI skill generation is not configured on this server.");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return client;
};
