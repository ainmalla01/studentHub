// src/validators/skill.validator.js
import { z } from "zod";

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Skill name must be at least 2 characters")
    .max(100, "Skill name must not exceed 100 characters"),

  category: z.enum([
    "PROGRAMMING",
    "FRONTEND",
    "BACKEND",
    "DATABASE",
    "DEVOPS",
    "TOOLS",
  ]),
});

export const createSkillsSchema = z.object({
  skills: z
    .array(skillSchema)
    .min(1, "At least one skill is required")
    .max(50, "You can add a maximum of 50 skills at once"),
});

// Optional schema helper for validating incoming AI payload structure
export const aiSkillsResponseSchema = z.object({
  skills: z.array(skillSchema),
});