import { z } from "zod";

export const createSubmissionSchema = z.object({
  githubLink: z.string().url().optional().or(z.literal("")),

  description: z.string().trim().max(5000).optional(),
});

export const evaluateSubmissionSchema = z.object({
  scores: z
    .array(
      z.object({
        rubricId: z.string().uuid(),
        score: z.number().int().min(0),
        feedback: z.string().trim().max(5000).optional(),
      })
    )
    .min(1),

  feedback: z.string().trim().max(5000).optional(),
});

export const submissionQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().optional(),

  status: z
    .enum([
      "ALL",
      "SUBMITTED",
      "UNDER_REVIEW",
      "EVALUATED",
    ])
    .default("ALL")
    .optional(),
});