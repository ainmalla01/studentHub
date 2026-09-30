import { z } from "zod";

export const SKILL_CATEGORIES = [
  "PROGRAMMING",
  "FRONTEND",
  "BACKEND",
  "DATABASE",
  "DEVOPS",
  "TOOLS",
];

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Skill name must be at least 2 characters")
    .max(100, "Skill name must not exceed 100 characters"),
  category: z.enum(SKILL_CATEGORIES),
});

export const createSkillsSchema = z.object({
  skills: z
    .array(skillSchema)
    .min(1, "At least one skill is required")
    .max(50, "You can add a maximum of 50 skills at once"),
});

export const skillQuerySchema = z.object({
  category: z.enum(SKILL_CATEGORIES).optional(),
});

export const generateSkillsSchema = z.object({
  program: z.string().trim().min(2).max(100),
  focus: z.string().trim().min(2).max(100),
  count: z.coerce.number().int().min(1).max(50).default(20),
});

// Validates the payload returned by the AI provider
export const aiSkillsResponseSchema = z.object({
  skills: z.array(skillSchema),
});
