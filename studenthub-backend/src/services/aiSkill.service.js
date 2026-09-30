// src/services/aiSkill.service.js
import { ai } from "../config/ai.js";
import { aiSkillsResponseSchema } from "../validators/skill.validator.js";

const ALLOWED_CATEGORIES = [
  "PROGRAMMING",
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "DEVOPS",
  "TOOLS",
];

export const generateSkills = async ({
  program,
  focus,
  count = 20,
}) => {
  const prompt = `
You are helping a college administrator create a skill library for StudentHub.

Generate ${count} relevant technical skills based on:

Program: ${program}
Focus Area: ${focus}

Allowed skill categories are ONLY:
${ALLOWED_CATEGORIES.join(", ")}

Rules:
- Generate practical and relevant technical skills.
- Do not generate duplicate skills.
- Each skill must have a clear name.
- Every skill must use exactly one of the allowed categories.
- Do not create your own categories.
- Do not include explanations.
- Return exactly ${count} skills if possible.
`;

  const maxRetries = 3;
  const delay = 2000; // 2 seconds delay between retries
  let response;

  // Retry loop to handle temporary 503 high demand spikes
  for (let i = 0; i < maxRetries; i++) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
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
                    name: {
                      type: "STRING",
                    },
                    category: {
                      type: "STRING",
                      enum: ALLOWED_CATEGORIES,
                    },
                  },
                  required: ["name", "category"],
                },
              },
            },
            required: ["skills"],
          },
        },
      });

      // If successful, break out of the retry loop
      break;
    } catch (error) {
      if (error.status === 503 && i < maxRetries - 1) {
        console.warn(`Model overloaded (503), retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries - 1})`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }

  if (!response || !response.text) {
    throw new Error("AI did not return any skills.");
  }

  let parsed;

  try {
    parsed = JSON.parse(response.text);
  } catch {
    throw new Error("AI returned an invalid response.");
  }

  const validated = aiSkillsResponseSchema.parse(parsed);

  return validated.skills;
};