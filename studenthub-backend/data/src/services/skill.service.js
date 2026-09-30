import { prisma } from "../config/prisma.js";

export const getAllSkills = (filters = {}) =>
  prisma.skill.findMany({
    where: filters.category ? { category: filters.category } : {},
    orderBy: { name: "asc" },
  });

// Skill.name is globally unique, so duplicates are detected by name only.
const keyOf = (skill) => skill.name.trim().toLowerCase();

/**
 * Bulk-creates skills, ignoring duplicates (case-insensitive) both inside the
 * request and against skills that already exist.
 */
export const createSkills = async (skills) => {
  const unique = [
    ...new Map(skills.map((s) => [keyOf(s), { name: s.name.trim(), category: s.category }])).values(),
  ];

  const existing = await prisma.skill.findMany({
    where: {
      OR: unique.map((s) => ({ name: { equals: s.name, mode: "insensitive" } })),
    },
    select: { name: true, category: true },
  });

  // Skill.name is globally unique, so a name that exists in any category is a duplicate.
  const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));
  const toCreate = unique.filter((s) => !existingNames.has(s.name.toLowerCase()));
  const skipped = unique.filter((s) => existingNames.has(s.name.toLowerCase()));

  if (toCreate.length === 0) return { count: 0, created: [], skipped };

  const result = await prisma.skill.createMany({ data: toCreate, skipDuplicates: true });
  return { count: result.count, created: toCreate, skipped };
};
