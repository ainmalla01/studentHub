import { z } from "zod";
import { DEPARTMENTS } from "../utils/departments.js";

const rubricItem = z.object({
  name: z.string().trim().min(1).max(100),
  weight: z.number().min(0).max(100),
});

export const createChallengeSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(1).max(10_000),
  instructions: z.string().trim().min(1).max(20_000),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  deadline: z.string().datetime({ offset: true }),
  submissionType: z.enum(["GITHUB_LINK", "FILE_UPLOAD", "BOTH"]),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  skillIds: z.array(z.string().uuid()).max(30).optional(),
  // Matches the Department enum. An empty/missing list means "ALL".
  departments: z.array(z.enum(DEPARTMENTS)).max(DEPARTMENTS.length).optional(),
  rubric: z.array(rubricItem).max(20).optional(),
});

export const updateChallengeSchema = createChallengeSchema.partial();

export const challengeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});
