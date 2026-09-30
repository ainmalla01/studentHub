import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

const round = (value) => Number((value ?? 0).toFixed(2));

const PENDING = { in: ["SUBMITTED", "UNDER_REVIEW"] };

export const getDashboardReport = async (collegeId) => {
  const inCollege = { challenge: { collegeId } };

  const [
    totalStudents,
    activeChallenges,
    pendingSubmissions,
    evaluatedSubmissions,
    average,
    recentChallenges,
    pendingEvaluations,
  ] = await Promise.all([
    prisma.student.count({ where: { collegeId } }),
    prisma.challenge.count({ where: { collegeId, status: "PUBLISHED" } }),
    prisma.submission.count({ where: { ...inCollege, status: PENDING } }),
    prisma.submission.count({ where: { ...inCollege, status: "EVALUATED" } }),
    prisma.submission.aggregate({
      where: { ...inCollege, score: { not: null } },
      _avg: { score: true },
    }),
    prisma.challenge.findMany({
      where: { collegeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { submissions: true } } },
    }),
    prisma.submission.findMany({
      where: { ...inCollege, status: PENDING },
      orderBy: { createdAt: "asc" },
      take: 10,
      include: { student: true, challenge: true },
    }),
  ]);

  return {
    stats: {
      totalStudents,
      activeChallenges,
      pendingSubmissions,
      evaluatedSubmissions,
      averagePerformance: round(average._avg.score),
    },
    recentChallenges,
    pendingEvaluations,
  };
};

export const getStudentPerformance = async (studentId, collegeId) => {
  const student = await prisma.student.findFirst({ where: { id: studentId, collegeId } });
  if (!student) throw new AppError(404, "Student not found.");

  const [submissions, skills] = await Promise.all([
    prisma.submission.findMany({
      where: { studentId, score: { not: null } },
      include: { challenge: true, evaluation: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.studentSkill.findMany({
      where: { studentId },
      include: { skill: true },
      orderBy: { score: "desc" },
    }),
  ]);

  const averageScore = submissions.length
    ? submissions.reduce((sum, s) => sum + (s.score ?? 0), 0) / submissions.length
    : 0;

  return { student, submissions, skills, averageScore: round(averageScore) };
};

export const getSkillReport = async (collegeId) => {
  const skills = await prisma.skill.findMany({
    include: {
      students: { where: { student: { collegeId } }, select: { score: true, level: true } },
      challenges: { where: { challenge: { collegeId } }, select: { id: true } },
    },
    orderBy: { name: "asc" },
  });

  return skills.map((skill) => {
    const scores = skill.students.map((s) => s.score);
    const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const levelCount = (level) => skill.students.filter((s) => s.level === level).length;

    return {
      id: skill.id,
      name: skill.name,
      category: skill.category,
      studentsAssessed: scores.length,
      challengesUsingSkill: skill.challenges.length,
      averageScore: round(average),
      levelDistribution: {
        BASIC: levelCount("BASIC"),
        INTERMEDIATE: levelCount("INTERMEDIATE"),
        ADVANCED: levelCount("ADVANCED"),
      },
    };
  });
};

export const getSubmissionReport = async (collegeId) => {
  const where = { challenge: { collegeId } };

  const [grouped, average] = await Promise.all([
    prisma.submission.groupBy({ by: ["status"], where, _count: { _all: true } }),
    prisma.submission.aggregate({ where: { ...where, score: { not: null } }, _avg: { score: true } }),
  ]);

  return { status: grouped, averageScore: round(average._avg.score) };
};
