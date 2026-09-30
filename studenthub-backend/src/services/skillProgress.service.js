import { calculateSkillScores } from "../utils/skillScoring.js";

/**
 * Recomputes a student's per-skill scores/levels from all of their evaluated
 * submissions. Runs inside the evaluation transaction so the two stay consistent.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {string} studentId
 */
export const recomputeStudentSkills = async (tx, studentId) => {
  const evaluated = await tx.submission.findMany({
    where: { studentId, status: "EVALUATED", score: { not: null } },
    select: { score: true, challenge: { select: { skills: { select: { skillId: true } } } } },
  });

  for (const { skillId, score, level } of calculateSkillScores(evaluated)) {
    await tx.studentSkill.upsert({
      where: { studentId_skillId: { studentId, skillId } },
      create: { studentId, skillId, score, level },
      update: { score, level },
    });
  }
};
