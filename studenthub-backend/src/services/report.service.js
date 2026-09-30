import { prisma } from "../config/prisma.js";


// ============================================================
// COLLEGE SIDE
// REPORTS
// ============================================================


// ------------------------------------------------------------
// Dashboard Report
// College → Reports → Dashboard
// ------------------------------------------------------------

export const getDashboardReport = async () => {
  const [
    totalStudents,
    activeChallenges,
    pendingSubmissions,
    evaluatedSubmissions,
    average,
    recentChallenges,
    pendingEvaluations,
  ] = await Promise.all([

    // Total students
    prisma.student.count(),

    // Published/active challenges
    prisma.challenge.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    // Submissions waiting for evaluation
    prisma.submission.count({
      where: {
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW"],
        },
      },
    }),

    // Evaluated submissions
    prisma.submission.count({
      where: {
        status: "EVALUATED",
      },
    }),

    // Average score of evaluated submissions
    prisma.submission.aggregate({
      where: {
        score: {
          not: null,
        },
      },

      _avg: {
        score: true,
      },
    }),

    // Five most recent challenges
    prisma.challenge.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    }),

    // Pending submissions for evaluation
    prisma.submission.findMany({
      where: {
        status: {
          in: ["SUBMITTED", "UNDER_REVIEW"],
        },
      },

      orderBy: {
        createdAt: "asc",
      },

      take: 10,

      include: {
        student: true,
        challenge: true,
      },
    }),
  ]);

  return {
    stats: {
      totalStudents,
      activeChallenges,
      pendingSubmissions,
      evaluatedSubmissions,

      averagePerformance: Number(
        (average._avg.score ?? 0).toFixed(2)
      ),
    },

    recentChallenges,

    pendingEvaluations,
  };
};


// ------------------------------------------------------------
// Student Performance Report
// College → Reports → Student Performance
// ------------------------------------------------------------

export const getStudentPerformance = async (
  studentId
) => {
  const [
    student,
    submissions,
    skills,
  ] = await Promise.all([

    // Student information
    prisma.student.findUnique({
      where: {
        id: studentId,
      },
    }),

    // Student submissions with scores
    prisma.submission.findMany({
      where: {
        studentId,
        score: {
          not: null,
        },
      },

      include: {
        challenge: true,
        evaluation: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    }),

    // Student skills ordered by score
    prisma.studentSkill.findMany({
      where: {
        studentId,
      },

      include: {
        skill: true,
      },

      orderBy: {
        score: "desc",
      },
    }),
  ]);

  if (!student) {
    throw new Error("Student not found");
  }

  const averageScore = submissions.length
    ? submissions.reduce(
        (s, x) => s + (x.score ?? 0),
        0
      ) / submissions.length
    : 0;

  return {
    student,
    submissions,
    skills,

    averageScore: Number(
      averageScore.toFixed(2)
    ),
  };
};


// ------------------------------------------------------------
// Skill Report
// College → Reports → Skills
// ------------------------------------------------------------

export const getSkillReport = async () => {
  const skills = await prisma.skill.findMany({
    include: {
      students: true,
      challenges: true,
    },
  });

  return skills.map((skill) => {
    const scores = skill.students.map(
      (s) => s.score
    );

    const averageScore = scores.length
      ? scores.reduce(
          (a, b) => a + b,
          0
        ) / scores.length
      : 0;

    return {
      id: skill.id,
      name: skill.name,
      category: skill.category,

      studentsAssessed: scores.length,

      averageScore: Number(
        averageScore.toFixed(2)
      ),

      levelDistribution: {
        BASIC: skill.students.filter(
          (s) => s.level === "BASIC"
        ).length,

        INTERMEDIATE: skill.students.filter(
          (s) => s.level === "INTERMEDIATE"
        ).length,

        ADVANCED: skill.students.filter(
          (s) => s.level === "ADVANCED"
        ).length,
      },
    };
  });
};


// ------------------------------------------------------------
// Submission Report
// College → Reports → Submissions
// ------------------------------------------------------------

export const getSubmissionReport = async () => {

  // Group submissions by status
  const grouped = await prisma.submission.groupBy({
    by: ["status"],

    _count: {
      _all: true,
    },
  });

  // Calculate average submission score
  const average = await prisma.submission.aggregate({
    where: {
      score: {
        not: null,
      },
    },

    _avg: {
      score: true,
    },
  });

  return {
    status: grouped,

    averageScore: Number(
      (average._avg.score ?? 0).toFixed(2)
    ),
  };
};