import { getAiClient } from "../config/ai.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";
import { SKILL_CATEGORIES, aiSkillsResponseSchema } from "../validators/skill.validator.js";

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Admin input is placed inside the prompt, so strip control characters/newlines.
const clean = (value) => String(value).replace(/[\r\n\t]+/g, " ").trim();

export const generateSkills = async ({ program, focus, count = 20 }) => {
  const ai = getAiClient();

  const prompt = `
You are helping a college administrator create a skill library for StudentHub.

Generate ${count} relevant technical skills based on:

Program: ${clean(program)}
Focus Area: ${clean(focus)}

Allowed skill categories are ONLY:
${SKILL_CATEGORIES.join(", ")}

Rules:
- Generate practical and relevant technical skills.
- Do not generate duplicate skills.
- Each skill must have a clear name.
- Every skill must use exactly one of the allowed categories.
- Do not create your own categories.
- Do not include explanations.
- Return exactly ${count} skills if possible.
`;

  let response;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              skills: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    category: { type: "STRING", enum: SKILL_CATEGORIES },
                  },
                  required: ["name", "category"],
                },
              },
            },
            required: ["skills"],
          },
        },
      });
      break;
    } catch (error) {
      const retryable = error?.status === 503 || error?.status === 429;
      if (!retryable || attempt === MAX_ATTEMPTS) {
        logger.error({ err: error }, "AI skill generation failed");
        throw new AppError(502, "The AI service is unavailable right now. Please try again later.");
      }
      await sleep(BASE_DELAY_MS * attempt);
    }
  }

  if (!response?.text) throw new AppError(502, "The AI service did not return any skills.");

  let parsed;
  try {
    parsed = JSON.parse(response.text);
  } catch {
    throw new AppError(502, "The AI service returned an invalid response.");
  }

  const result = aiSkillsResponseSchema.safeParse(parsed);
  if (!result.success) throw new AppError(502, "The AI service returned an invalid response.");

  // De-duplicate by name (case-insensitive) and cap at the requested count.
  const seen = new Set();
  return result.data.skills
    .filter((skill) => {
      const key = skill.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, count);
};
