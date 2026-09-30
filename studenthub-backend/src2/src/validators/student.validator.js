import { z } from 'zod';

// Used by the college portal to register a student.
// `email` belongs to the User record (created alongside the Student),
// so it is only valid here — never on a Student update.
export const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().optional().or(z.literal('')),
  batch: z.coerce.number().int().min(2000).max(2100),
  department: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// College editing an existing Student row. Excludes `email`
// (not a Student field) so the payload can be spread into prisma.student.update.
export const updateStudentSchema = createStudentSchema
  .omit({ email: true })
  .partial()
  .extend({
    location: z.string().trim().max(200).optional(),
    headline: z.string().trim().max(200).optional(),
    about: z.string().trim().max(5000).optional(),
    university: z.string().trim().max(200).optional(),
  });

// Student editing their own profile. Deliberately excludes
// `status`, `email`, `department` and `batch` (admin-controlled).
export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  location: z.string().trim().max(200).optional(),
  headline: z.string().trim().max(200).optional(),
  about: z.string().trim().max(5000).optional(),
  university: z.string().trim().max(200).optional(),
});

export const studentIdSchema = z.object({ studentId: z.string().trim().min(2) });
