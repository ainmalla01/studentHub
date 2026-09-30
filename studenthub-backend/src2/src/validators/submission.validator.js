import { z } from 'zod';

export const createSubmissionSchema = z.object({
  githubLink: z.string().url().optional().or(z.literal('')),
  description: z.string().trim().max(5000).optional(),
});

export const evaluateSubmissionSchema = z.object({
  functionality: z.number().int().min(0).max(40),
  codeQuality: z.number().int().min(0).max(20),
  documentation: z.number().int().min(0).max(20),
  problemSolving: z.number().int().min(0).max(20),
  feedback: z.string().trim().max(5000).optional(),
  verified: z.boolean().default(false),
});

export const submissionQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum([
  "ALL",
  "SUBMITTED",
  "UNDER_REVIEW",
  "EVALUATED",
]).default("ALL").optional(),
})

