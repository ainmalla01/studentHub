import { z } from 'zod';

const rubricItem = z.object({ name: z.string().trim().min(1), weight: z.number().min(0).max(100) });


// Regular expression to validate YYYY-MM-DD date format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createChallengeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  instructions: z.string().min(1, "Instructions are required"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  startDate: z.string().regex(dateRegex, "Start date must be in YYYY-MM-DD format"),
  deadline: z.string().regex(dateRegex, "Deadline must be in YYYY-MM-DD format"),
  submissionType: z.enum(["GITHUB_LINK", "FILE_UPLOAD", "BOTH"]),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).optional(),
  skillIds: z.array(z.string().uuid()).optional(),
  departments: z.array(z.enum(["ALL", "BCA", "CSIT", "BIT"])).optional(),
});

export const updateChallengeSchema = createChallengeSchema.partial();

export const challengeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
});
