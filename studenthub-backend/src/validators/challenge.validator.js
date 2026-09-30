import { z } from 'zod';

// ==========================================
// RUBRIC
// ==========================================

const rubricItem = z.object({
  name: z.string().trim().min(1, "Rubric name is required").max(100),
  description: z.string().trim().max(500).optional(),
  maxScore: z.number().int().positive("Maximum score must be greater than 0")
});



const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ==========================================
// CREATE CHALLENGE
// ==========================================

export const createChallengeSchema = z.object({
  title: z.string().min(1, "Title is required"),

  description: z.string().min(1, "Description is required"),

  instructions: z.string().min(1, "Instructions are required"),

  difficulty: z.enum([
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED"
  ]),

  startDate: z
    .string()
    .regex(dateRegex, "Start date must be in YYYY-MM-DD format"),

  deadline: z
    .string()
    .regex(dateRegex, "Deadline must be in YYYY-MM-DD format"),

  submissionType: z.enum([
    "GITHUB_LINK",
    "FILE_UPLOAD",
    "BOTH"
  ]),

  status: z
    .enum(["DRAFT", "PUBLISHED", "CLOSED"])
    .optional(),

  skillIds: z
    .array(z.string().uuid())
    .optional(),

  departments: z
    .array(z.enum(["ALL", "BCA", "CSIT", "BIT"]))
    .optional(),

  // ==========================================
  // RUBRICS
  // ==========================================

  rubrics: z
    .array(rubricItem)
    .min(1, "At least one rubric criterion is required")
});

// ==========================================
// UPDATE CHALLENGE
// ==========================================

export const updateChallengeSchema =
  createChallengeSchema.partial();

// ==========================================
// CHALLENGE QUERY
// ==========================================

export const challengeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().optional(),

  status: z
    .enum(["DRAFT", "PUBLISHED", "CLOSED"])
    .optional(),

  difficulty: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
    .optional()
});