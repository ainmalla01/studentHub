import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";



export const getCollegeDashboard = async () => {
// getting all the info/data
  const [
    totalStudents,
    activeChallenges,
    pendingSubmissions,
    evaluatedSubmissions,
    recentChallenges,
    pendingEvaluations
  ] = await Promise.all([
    prisma.student.count(),
    prisma.challenge.count({ where: { status: 'PUBLISHED' } }),
    prisma.submission.count({ where: { status: 'SUBMITTED' } }),
    prisma.submission.count({ where: { status: 'EVALUATED' } }),
    prisma.challenge.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.submission.findMany({
      where: { status: 'SUBMITTED' },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // 2. Return the complete report object
  return {
    stats: {
      totalStudents,
      activeChallenges,
      pendingSubmissions,
      evaluatedSubmissions,
      // averagePerformance,
    },
    recentChallenges,
    pendingEvaluations,
  };
};