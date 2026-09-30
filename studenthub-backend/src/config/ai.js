// src/config/google_ai.js
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in environment variables.");
}

// Initialize and export the Google GenAI client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});