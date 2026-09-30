import { z } from 'zod';

export const uuidParam = z.object({ id: z.string().uuid() });

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export const studentQuery = paginationQuery.extend({
  department: z.string().trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  batch: z.coerce.number().int().optional(),
});


// student
export const studentChallengeQuery=z.object({
   search: z.string().trim().optional(),
  difficulty:z.enum([]).optional(),
  department:z.enum([]).optional(),
})

