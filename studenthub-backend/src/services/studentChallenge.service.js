import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

import {
  includeChallenge,
  getChallengeById,
  formatStudentChallenge,
} from "./challenge.service.js";
import { calculateChallengeStatus } from "../utils/calculateChallengeStatus.js";

// ============================================================
// STUDENT SIDE
// CHALLENGES
// ============================================================

// ============================================================
// CHALLENGE DISCOVERY
// ============================================================

// ------------------------------------------------------------
// Get Published / Active Challenges
// Student → Challenges → List
// ------------------------------------------------------------


export const getParticipateChallengeList = async (studentId) => {
  const participations =
    await prisma.challengeParticipate.findMany({
      where: {
        studentId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        challenge: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },

            submissions: {
              where: {
                studentId,
              },
              select: {
                id: true,
                challengeId: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                githubLink: true,
                description: true,
              },
            },

            _count: {
              select: {
                participations: true,
                submissions: true,
              },
            },
          },
        },
      },
    });

  return participations.map((participation) => {
    const challenge = participation.challenge;

    return {
      ...challenge,

      participated: true,

      totalParticipation:
        challenge._count.participations,

      totalSubmissions:
        challenge._count.submissions,

      studentSubmission:
        challenge.submissions[0] ?? null,

      _count: undefined,
      submissions: undefined,
    };
  });
};

export const getStudentChallenges = async (
  params = {},
  studentId
) => {
  const {
    search,
    difficulty,
    department,
  } = params;

  // ----------------------------------------------------------
  // Build Where Condition
  // ----------------------------------------------------------
  console.log("students service part")

  const where = {
    // Do NOT filter by status here.
    // We want all challenges and will remove CLOSED
    // after calculating their actual status.

    // Difficulty
    ...(difficulty
      ? {
          difficulty,
        }
      : {}),

    // Search
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

    // Department
    ...(department && department !== "ALL"
      ? {
          departments: {
            has: department,
          },
        }
      : {}),
  };

  // ----------------------------------------------------------
  // Get Challenges
  // ----------------------------------------------------------

  const items = await prisma.challenge.findMany({
    where,

    include: {
      ...includeChallenge,

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

    take: 10,
  });

  // ----------------------------------------------------------
  // Format + Remove CLOSED
  // ----------------------------------------------------------

  const result = items
    .map(formatStudentChallenge)
    .filter(
      (challenge) => challenge.status !== "CLOSED"
    );
    console.log("students: challenge students :",result)

  return {
    result,
  };
};

// ============================================================
// SINGLE CHALLENGE
// ============================================================

// ------------------------------------------------------------
// Get Single Challenge
// Student → Challenges → Challenge Details
// ------------------------------------------------------------
// export const getStudentChallenge = async (
//   id,
//   studentId
// ) => {
//   const checkChallenge= await prisma.challenge.findFirst({where:{id:id}})
//   if(!checkChallenge){
//     console.log("challenge doesnot exist")
//   }
//   const challenge = await getChallengeById(
//     id,
//     {},
//     {
//       participations: {
//         where: {
//           studentId,
//         },
//       },
//     }
//   );

//   console.log("CHALLENGE:", challenge);
//   console.log("PARTICIPATIONS:", challenge?.participations);

//   const formatted = formatStudentChallenge(challenge);

//   const participated =
//     challenge.participations.length > 0;

//   return {
//     ...formatted,
//     description: challenge.description,
//     instruction: challenge.instructions,
//     participated,
//   };
// };
// ============================================================
// CHALLENGE PARTICIPATION
// ============================================================

// ------------------------------------------------------------
// Participate In Challenge
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

  // ----------------------------------------------------------
  // Find Challenge
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // Check Challenge Start
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // Check Challenge Deadline
  // ----------------------------------------------------------

  if (now > end) {
    throw new AppError(
      400,
      "Cannot participate; this challenge has already ended/closed."
    );
  }

  // ----------------------------------------------------------
  // Verify Student
  // ----------------------------------------------------------

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

  // ----------------------------------------------------------
  // Check Existing Participation
  // ----------------------------------------------------------

  const existingParticipation =
    await prisma.challengeParticipate.findFirst(
      {
        where: {
          studentId,
          challengeId,
        },
      }
    );

  if (existingParticipation) {
    return existingParticipation;
  }

  // ----------------------------------------------------------
  // Create Participation
  // ----------------------------------------------------------

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
    await prisma.challengeParticipate.findFirst(
      {
        where: {
          studentId,
          challengeId,
        },
      }
    );

  return {
    participated:
      !!participation,
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
  params = {}
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