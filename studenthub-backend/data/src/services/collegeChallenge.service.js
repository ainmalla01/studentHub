import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { buildPagination, skipTake } from "../utils/pagination.js";

const includeChallenge = {
  skills: { include: { skill: true } },
  _count: { select: { submissions: true, participations: true } },
};

const uniqueIds = (ids) => [...new Set(ids)];

const normalizeDepartments = (departments) =>
  !departments || departments.length === 0 ? ["ALL"] : uniqueIds(departments);

const findOwned = async (id, collegeId) => {
  const challenge = await prisma.challenge.findFirst({ where: { id, collegeId } });
  if (!challenge) throw new AppError(404, "Challenge not found.");
  return challenge;
};

const withCounts = ({ _count, ...challenge }) => ({
  ...challenge,
  totalParticipation: _count.participations,
  totalSubmissions: _count.submissions,
});

export const getCollegeChallenges = async (params, collegeId) => {
  const { page, limit, search, status, difficulty } = params;

  const where = {
    collegeId,
    ...(status ? { status } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.challenge.findMany({
      where,
      include: includeChallenge,
      orderBy: { createdAt: "desc" },
      ...skipTake({ page, limit }),
    }),
    prisma.challenge.count({ where }),
  ]);

  return { result: items.map(withCounts), pagination: buildPagination({ page, limit, total }) };
};

export const getCollegeChallenge = async (id, collegeId) => {
  const challenge = await prisma.challenge.findFirst({
    where: { id, collegeId },
    include: {
      ...includeChallenge,
      submissions: {
        include: { student: true, evaluation: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!challenge) throw new AppError(404, "Challenge not found.");

  return {
    challengeinfo: withCounts(challenge),
    description: challenge.description,
    instruction: challenge.instructions,
  };
};

export const createChallenge = async (input, collegeId) => {
  const { skillIds = [], departments, ...data } = input;

  if (new Date(data.deadline) <= new Date()) {
    throw new AppError(400, "Deadline must be in the future.");
  }

  return prisma.challenge.create({
    data: {
      ...data,
      collegeId,
      departments: normalizeDepartments(departments),
      skills: {
        create: uniqueIds(skillIds).map((skillId) => ({ skill: { connect: { id: skillId } } })),
      },
    },
    include: includeChallenge,
  });
};

export const updateChallenge = async (id, collegeId, input) => {
  const existing = await findOwned(id, collegeId);
  const { skillIds, departments, ...data } = input;

  if (data.deadline && new Date(data.deadline) <= new Date() && existing.status !== "CLOSED") {
    throw new AppError(400, "Deadline must be in the future.");
  }

  return prisma.$transaction(async (tx) => {
    if (skillIds) {
      await tx.challengeSkill.deleteMany({ where: { challengeId: id } });
      await tx.challengeSkill.createMany({
        data: uniqueIds(skillIds).map((skillId) => ({ challengeId: id, skillId })),
      });
    }

    return tx.challenge.update({
      where: { id },
      data: {
        ...data,
        ...(departments ? { departments: normalizeDepartments(departments) } : {}),
      },
      include: includeChallenge,
    });
  });
};

export const publishChallenge = async (id, collegeId) => {
  const challenge = await findOwned(id, collegeId);

  if (challenge.status === "CLOSED") {
    throw new AppError(409, "A closed challenge cannot be published.");
  }
  if (challenge.deadline <= new Date()) {
    throw new AppError(400, "Update the deadline to a future date before publishing.");
  }

  return prisma.challenge.update({
    where: { id },
    data: { status: "PUBLISHED" },
    include: includeChallenge,
  });
};

export const closeChallenge = async (id, collegeId) => {
  const challenge = await findOwned(id, collegeId);

  if (challenge.status !== "PUBLISHED") {
    throw new AppError(409, "Only a published challenge can be closed.");
  }

  return prisma.challenge.update({
    where: { id },
    data: { status: "CLOSED" },
    include: includeChallenge,
  });
};

export const deleteChallenge = async (id, collegeId) => {
  await findOwned(id, collegeId);

  // Deleting cascades to submissions and evaluations, so refuse when work exists.
  const submissions = await prisma.submission.count({ where: { challengeId: id } });
  if (submissions > 0) {
    throw new AppError(
      409,
      "This challenge already has submissions and cannot be deleted. Close it instead.",
    );
  }

  await prisma.challenge.delete({ where: { id } });
};
