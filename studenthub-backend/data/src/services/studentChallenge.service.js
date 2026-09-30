import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { visibleDepartmentsFor } from "../utils/departments.js";
import { buildPagination, skipTake } from "../utils/pagination.js";

const skillsInclude = { skills: { include: { skill: true } } };

/** Challenges a student is allowed to see: own college + own (or ALL) department. */
const scopeFor = (student) => ({
  collegeId: student.collegeId,
  departments: { hasSome: visibleDepartmentsFor(student.department) },
});

const searchFilter = (search) =>
  search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

export const getStudentChallenges = async (params, student) => {
  const { page, limit, search, difficulty } = params;

  const where = {
    ...scopeFor(student),
    status: "PUBLISHED",
    ...(difficulty ? { difficulty } : {}),
    ...searchFilter(search),
  };

  const [items, total] = await prisma.$transaction([
    prisma.challenge.findMany({
      where,
      include: {
        ...skillsInclude,
        _count: { select: { participations: true, submissions: true } },
        participations: { where: { studentId: student.id }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      ...skipTake({ page, limit }),
    }),
    prisma.challenge.count({ where }),
  ]);

  const result = items.map(({ _count, participations, ...challenge }) => ({
    ...challenge,
    totalParticipation: _count.participations,
    totalSubmissions: _count.submissions,
    participated: participations.length > 0,
  }));

  return { result, pagination: buildPagination({ page, limit, total }) };
};

export const getStudentChallenge = async (id, student) => {
  const challenge = await prisma.challenge.findFirst({
    where: { id, ...scopeFor(student), status: { in: ["PUBLISHED", "CLOSED"] } },
    include: {
      ...skillsInclude,
      _count: { select: { participations: true, submissions: true } },
      participations: { where: { studentId: student.id }, select: { id: true } },
      submissions: {
        where: { studentId: student.id },
        select: { id: true, status: true, score: true, feedback: true, createdAt: true },
        take: 1,
      },
    },
  });
  if (!challenge) throw new AppError(404, "Challenge not found.");

  const { _count, participations, submissions, ...rest } = challenge;

  return {
    ...rest,
    totalParticipation: _count.participations,
    totalSubmissions: _count.submissions,
    participated: participations.length > 0,
    mySubmission: submissions[0] ?? null,
    description: challenge.description,
    instruction: challenge.instructions,
  };
};

export const participateInChallenge = async (student, challengeId) => {
  const challenge = await prisma.challenge.findFirst({
    where: { id: challengeId, ...scopeFor(student), status: "PUBLISHED" },
    select: { id: true, deadline: true },
  });
  if (!challenge) throw new AppError(404, "Published challenge not found.");
  if (challenge.deadline < new Date()) throw new AppError(400, "The challenge deadline has passed.");

  // Idempotent: joining twice returns the existing participation.
  return prisma.challengeParticipate.upsert({
    where: { studentId_challengeId: { studentId: student.id, challengeId } },
    create: { studentId: student.id, challengeId },
    update: {},
  });
};

export const checkParticipation = async (studentId, challengeId) => {
  const participation = await prisma.challengeParticipate.findUnique({
    where: { studentId_challengeId: { studentId, challengeId } },
    select: { id: true },
  });
  return { participated: participation !== null };
};

export const getMySubmissions = (studentId) =>
  prisma.submission.findMany({
    where: { studentId },
    include: { challenge: true, evaluation: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

export const getStudentDashboard = async (student) => {
  const now = new Date();

  const [participations, byStatus, scored, upcoming] = await Promise.all([
    prisma.challengeParticipate.count({ where: { studentId: student.id } }),
    prisma.submission.groupBy({
      by: ["status"],
      where: { studentId: student.id },
      _count: { _all: true },
    }),
    prisma.submission.aggregate({
      where: { studentId: student.id, score: { not: null } },
      _avg: { score: true },
    }),
    prisma.challenge.findMany({
      where: {
        ...scopeFor(student),
        status: "PUBLISHED",
        deadline: { gt: now },
        submissions: { none: { studentId: student.id } },
      },
      orderBy: { deadline: "asc" },
      take: 5,
      select: { id: true, title: true, difficulty: true, deadline: true },
    }),
  ]);

  const count = (status) => byStatus.find((g) => g.status === status)?._count._all ?? 0;

  return {
    stats: {
      participations,
      totalSubmissions: byStatus.reduce((sum, g) => sum + g._count._all, 0),
      submitted: count("SUBMITTED"),
      underReview: count("UNDER_REVIEW"),
      evaluated: count("EVALUATED"),
      averageScore: Number((scored._avg.score ?? 0).toFixed(2)),
    },
    upcomingChallenges: upcoming,
  };
};
