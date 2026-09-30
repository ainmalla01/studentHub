import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";


// ============================================================
// STUDENT SIDE
// CHALLENGES
// ============================================================


// ------------------------------------------------------------
// Shared Student Challenge Include
// ------------------------------------------------------------

const studentChallengeInclude = {
  skills: {
    include: {
      skill: true,
    },
  },
};


// ------------------------------------------------------------
// Helper: Calculate Live / Dynamic Challenge Status
// ------------------------------------------------------------

const calculateChallengeStatus = (challenge) => {
  if (challenge.status === "DRAFT") {
    return "DRAFT";
  }

  const now = new Date();
  const start = new Date(challenge.startDate);
  const end = new Date(challenge.deadline);

  if (now < start) {
    return "UPCOMING";
  } else if (now >= start && now <= end) {
    return "PUBLISHED"; // Active / Ongoing
  } else {
    return "CLOSED";
  }
};


// ============================================================
// CHALLENGE DISCOVERY
// ============================================================


// ------------------------------------------------------------
// Get Published / Active Challenges
// Student → Challenges → List
// ------------------------------------------------------------

export const getStudentChallenges = async (
  params,
  studentId
) => {
  const {
    search,
    difficulty,
    department
  } = params;

  // Query challenges that are published in the database
  const where = {
    status: "PUBLISHED",

    ...(difficulty
      ? {
          difficulty,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },

            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [
    items
  ] = await prisma.$transaction([

    prisma.challenge.findMany({
      where,

      include: {
        ...studentChallengeInclude,

        _count: {
          select: {
            participations: true,
            submissions: true,
          },
        },

        participations: {
          where: {
            studentId,
          },

          select: {
            id: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.challenge.count({
      where,
    }),
  ]);
const result = items
  .map(({ _count, participations, ...challenge }) => {
    const computedStatus = calculateChallengeStatus(challenge);

    return {
      ...challenge,
      status: computedStatus
    };
  })
  .filter((challenge) => challenge.status !== "CLOSED");
  return {
    result
  };
};


// ------------------------------------------------------------
// Get Single Challenge
// Student → Challenges → Challenge Details
// ------------------------------------------------------------

export const getStudentChallenge = async (
  id,
  studentId
) => {

  const challenge =
    await prisma.challenge.findFirst({
      where: {
        id,
      },

      include: {
        ...studentChallengeInclude,

        _count: {
          select: {
            participations: true,
            submissions: true,
          },
        },

        participations: {
          where: {
            studentId,
          },
        },
      },
    });

  if (!challenge) {
    throw new AppError(
      404,
      "Challenge not found."
    );
  }

  const {
    _count,
    participations,
    ...rest
  } = challenge;

  const computedStatus =
    calculateChallengeStatus(
      challenge
    );

  return {
    ...rest,

    status: computedStatus,

    totalParticipation:
      _count?.participations || 0,

    totalSubmissions:
      _count?.submissions || 0,

    participated:
      participations.length > 0,

    description:
      challenge.description,

    instruction:
      challenge.instructions,
  };
};


// ============================================================
// CHALLENGE PARTICIPATION
// ============================================================


// ------------------------------------------------------------
// Participate in Challenge
// Student → Challenge Details → Participate
// ------------------------------------------------------------

export const participateInChallenge = async (
  studentId,
  challengeId
) => {

  if (!challengeId) {
    throw new AppError(
      400,
      "Challenge ID is required to participate."
    );
  }


  const challenge =
    await prisma.challenge.findFirst({
      where: {
        id: challengeId,
      },
    });

  if (!challenge) {
    throw new AppError(
      404,
      "Challenge not found."
    );
  }


  // Ensure challenge is currently active
  // between startDate and deadline
  const now = new Date();
  const start = new Date(
    challenge.startDate
  );
  const end = new Date(
    challenge.deadline
  );


  if (
    challenge.status !== "PUBLISHED" ||
    now < start
  ) {
    throw new AppError(
      400,
      "This challenge has not started yet or is not published."
    );
  }


  if (now > end) {
    throw new AppError(
      400,
      "Cannot participate; this challenge has already ended/closed."
    );
  }


  // Verify student profile exists
  const student =
    await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

  if (!student) {
    throw new AppError(
      404,
      "Student profile not found."
    );
  }


  // Check whether the student already participated
  const existingParticipation =
    await prisma.challengeParticipate.findFirst({
      where: {
        studentId,
        challengeId,
      },
    });


  if (existingParticipation) {
    return existingParticipation;
  }


  return prisma.challengeParticipate.create({
    data: {
      studentId,
      challengeId,
    },
  });
};


// ------------------------------------------------------------
// Check Challenge Participation
// Student → Challenge Details → Participation Status
// ------------------------------------------------------------

export const checkParticipation = async (
  studentId,
  challengeId
) => {

  const participation =
    await prisma.challengeParticipate.findFirst({
      where: {
        studentId,
        challengeId,
      },
    });

  return {
    participated: !!participation,
  };
};


// ============================================================
// STUDENT SUBMISSIONS
// ============================================================


// ------------------------------------------------------------
// Get My Submissions
// Student → Submissions
// ------------------------------------------------------------

export const getMySubmissions = async (
  studentId,
  params
) => {

  const submissions =
    await prisma.submission.findMany({
      where: {
        studentId,
      },

      include: {
        challenge: true,
        evaluation: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return submissions;
};