import { z } from "zod";
import { httpUrl } from "./common.js";

const githubUrl = httpUrl.refine((value) => {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "github.com" || host === "www.github.com";
  } catch {
    return false;
  }
}, "GitHub link must point to github.com");

export const createSubmissionSchema = z.object({
  challengeId: z.string().uuid(),
  githubLink: githubUrl.optional().or(z.literal("")),
  fileUrl: httpUrl.optional().or(z.literal("")),
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

export const submissionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "EVALUATED"]).optional(),
  challengeId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
});
