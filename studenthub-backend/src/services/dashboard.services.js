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


/**
 * Get dashboard statistics for the authenticated student.
 */
export async function getStudentDashboardStats(studentId) {
  if (!studentId) {
    throw new AppError(
      401,
      "Student authentication is required."
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
    },
  });

  if (!student) {
    throw new AppError(
      404,
      "Student not found."
    );
  }

  const [
    challengesCompleted,
    pendingSubmissions,
    totalScoreResult,
    portfolioCount,
  ] = await Promise.all([
    // ----------------------------------------------------------
    // Completed Challenges
    // ----------------------------------------------------------
    prisma.submission.count({
      where: {
        studentId,
        status: "EVALUATED",
      },
    }),

    // ----------------------------------------------------------
    // Pending Reviews
    // SUBMITTED + UNDER_REVIEW
    // ----------------------------------------------------------
    prisma.submission.count({
      where: {
        studentId,
        status: {
          in: [
            "SUBMITTED",
            "UNDER_REVIEW",
          ],
        },
      },
    }),

    // ----------------------------------------------------------
    // Total Score
    // Sum of evaluation totals belonging to this student
    // ----------------------------------------------------------
    prisma.evaluation.aggregate({
      where: {
        submission: {
          studentId,
        },
      },
      _sum: {
        total: true,
      },
    }),

    // ----------------------------------------------------------
    // Portfolio Items
    // Only verified evaluations are included.
    // ----------------------------------------------------------
    prisma.evaluation.count({
      where: {
        verified: true,
        submission: {
          studentId,
        },
      },
    }),
  ]);

  return {
    challengesCompleted,
    pendingSubmissions,
    totalScore: totalScoreResult._sum.total ?? 0,
    portfolioCount,
  };
}
