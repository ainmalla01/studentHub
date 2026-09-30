// src/services/submission.service.js

import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";


// ============================================================
// SHARED
// SUBMISSION DATA
// ============================================================

const includeSubmission = {
  student: true,

  challenge: {
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  },

  evaluation: true,
};


// ============================================================
// SHARED
// STUDENT RESOLUTION
// ============================================================

const resolveStudent = async (
  studentId,
  studentPublicId
) => {
  const student = studentId
    ? await prisma.student.findUnique({
        where: {
          id: studentId,
        },
      })
    : await prisma.student.findUnique({
        where: {
          studentId: studentPublicId,
        },
      });

  if (!student) {
    throw new AppError(
      404,
      "Student not found."
    );
  }

  if (student.status !== "ACTIVE") {
    throw new AppError(
      400,
      "Inactive students cannot submit work."
    );
  }

  return student;
};


// ============================================================
// STUDENT SIDE
// SUBMISSIONS
// ============================================================


// ------------------------------------------------------------
// Create Submission
// Student → Challenge → Submit Work
// ------------------------------------------------------------
export const createSubmission = async (studentId, data, challengeId) => {
  const challenge = await prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
  });

  if (!challenge) {
    throw new AppError(404, "Challenge not found.");
  }

  await prisma.submission.create({
    data: {
      studentId,
      challengeId,
      githubLink: data.githubLink,
      description: data.description || null,
    },
  });

  return {
    message: "Submission created successfully.",
  };
};


// ------------------------------------------------------------
// Get Student Submissions
// Student → Submissions → My Submissions
// ------------------------------------------------------------

export const getStudentSubmissions = async (
  studentId
) =>
  prisma.submission.findMany({
    where: {
      studentId,
    },

    include: includeSubmission,

    orderBy: {
      createdAt: "desc",
    },
  });


// ============================================================
// COLLEGE SIDE
// SUBMISSION MANAGEMENT
// ============================================================


// ------------------------------------------------------------
// Get All Submissions
// College → Submissions
// ------------------------------------------------------------
export const getSubmissions = async (params) => {
  const {
    page,
    limit,
    status,
    challengeId,
    studentId,
  } = params;

  const where = {
    ...(status && status !== "ALL"
      ? {
          status,
        }
      : {}),

    ...(challengeId
      ? {
          challengeId,
        }
      : {}),

    ...(studentId
      ? {
          studentId,
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where,

      include: includeSubmission,

      orderBy: {
        createdAt: "desc",
      },

      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.submission.count({
      where,
    }),
  ]);

  return {
    items,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


// ------------------------------------------------------------
// Get Submission By ID
// College → Submissions → Submission Details
// ------------------------------------------------------------

export const getSubmissionById = async (
  id
) => {

  const item =
    await prisma.submission.findUnique({
      where: {
        id,
      },

      include: includeSubmission,
    });

  if (!item) {
    throw new AppError(
      404,
      "Submission not found."
    );
  }

  return item;
};


// ------------------------------------------------------------
// Get Challenge Submissions
// College → Challenges → Challenge Submissions
// ------------------------------------------------------------

export const getChallengeSubmissions = async (
  challengeId
) =>
  prisma.submission.findMany({
    where: {
      challengeId,
    },

    include: includeSubmission,

    orderBy: {
      createdAt: "desc",
    },
  });


// ------------------------------------------------------------
// Evaluate Submission
// College → Submissions → Evaluate
// ------------------------------------------------------------

export const evaluateSubmission = async (
  id,
  input
) => {

  await getSubmissionById(id);


  // Calculate total evaluation score
  const total =
    input.functionality +
    input.codeQuality +
    input.documentation +
    input.problemSolving;


  return prisma.$transaction(async (tx) => {

    // Create or update evaluation
    await tx.evaluation.upsert({
      where: {
        submissionId: id,
      },

      create: {
        submissionId: id,
        ...input,
        total,
      },

      update: {
        ...input,
        total,
      },
    });


    // Mark submission as evaluated
    return tx.submission.update({
      where: {
        id,
      },

      data: {
        status: "EVALUATED",
        score: total,
        feedback: input.feedback ?? null,
      },

      include: includeSubmission,
    });
  });
};


// ------------------------------------------------------------
// Mark Submission Under Review
// College → Submissions → Under Review
// ------------------------------------------------------------

export const markUnderReview = async (
  id
) => {

  await getSubmissionById(id);

  return prisma.submission.update({
    where: {
      id,
    },

    data: {
      status: "UNDER_REVIEW",
    },

    include: includeSubmission,
  });
};


// ------------------------------------------------------------
// Submission Statistics
// College → Submissions → Statistics
// ------------------------------------------------------------

export const getSubmissionStatistics = async () => {

  const [
    submitted,
    underReview,
    evaluated,
    average,
  ] = await Promise.all([

    // Submitted
    prisma.submission.count({
      where: {
        status: "SUBMITTED",
      },
    }),

    // Under review
    prisma.submission.count({
      where: {
        status: "UNDER_REVIEW",
      },
    }),

    // Evaluated
    prisma.submission.count({
      where: {
        status: "EVALUATED",
      },
    }),

    // Average score
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
  ]);


  return {
    submitted,
    underReview,
    evaluated,

    averageScore: Number(
      (average._avg.score ?? 0).toFixed(2)
    ),
  };
};