import { z } from "zod";
import { paginationQuery } from "./common.js";

const email = z.string().trim().toLowerCase().email("Invalid email address").max(254);

export const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  batch: z.coerce.number().int().min(2000).max(2100),
  department: z.string().trim().min(2).max(120),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const studentIdSchema = z.object({ studentId: z.string().trim().min(2).max(50) });

export const studentQuerySchema = paginationQuery.extend({
  department: z.string().trim().max(120).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  batch: z.coerce.number().int().min(2000).max(2100).optional(),
});
