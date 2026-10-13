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
export const getParticipateChallengeList = async (
  params = {},
  studentId
) => {
  const { page = 1, limit = 20 } = params;

  const skip = (page - 1) * limit;

  console.log("Participated challenges service:", {
    page,
    limit,
    studentId,
  });

  const participations =
    await prisma.challengeParticipate.findMany({
      where: {
        studentId,
      },

      select: {
        id: true,
        createdAt: true,

        challenge: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            startDate: true,
            deadline: true,
            status: true,

            // Total number of students
            // participating in this challenge
            participations: {
              select: {
                id: true,
              },
            },

            // Only this student's latest submission
            submissions: {
              where: {
                studentId,
              },

              select: {
                id: true,
                status: true,
                createdAt: true,

                evaluation: {
                  select: {
                    total: true,
                    feedback: true,
                    verified: true,
                  },
                },
              },

              orderBy: {
                createdAt: "desc",
              },

              take: 1,
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    });

  const total =
    await prisma.challengeParticipate.count({
      where: {
        studentId,
      },
    });

  const now = new Date();

  const result = participations.map(
    (participation) => {
      const challenge = participation.challenge;

      let displayStatus = "UPCOMING";

      if (challenge.status === "CLOSED") {
        displayStatus = "CLOSED";
      } else if (
        challenge.status === "PUBLISHED"
      ) {
        if (
          now < new Date(challenge.startDate)
        ) {
          displayStatus = "UPCOMING";
        } else if (
          now > new Date(challenge.deadline)
        ) {
          displayStatus = "CLOSED";
        } else {
          displayStatus = "PUBLISHED";
        }
      }

      const submission =
        challenge.submissions.length > 0
          ? challenge.submissions[0]
          : null;

      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        startDate: challenge.startDate,
        deadline: challenge.deadline,

        status: displayStatus,

        totalParticipation:
          challenge.participations.length,

        participated: true,

        submission: submission
          ? {
              id: submission.id,
              status: submission.status,
              score:
                submission.evaluation?.total ??
                null,
              feedback:
                submission.evaluation?.feedback ??
                null,
              submittedAt:
                submission.createdAt,
            }
          : null,
      };
    }
  );

  return {
    result,

    meta: {
      page,
      limit,
      total,
      totalPages:
        Math.ceil(total / limit),
    },
  };
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

  const where = {
    ...(difficulty ? { difficulty } : {}),

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

    ...(department && department !== "ALL"
      ? {
          departments: {
            has: department,
          },
        }
      : {}),
  };

  const items = await prisma.challenge.findMany({
    where,
    include: {
      ...includeChallenge,

      // Check participation for the current student
      participations: {
        where: {
          studentId,
        },
        select: {
          id: true,
        },
      },

      // Check submissions for the current student
      submissions: {
        where: {
          studentId,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  const result = items
    .map((item) => {
      const challenge = formatStudentChallenge(item);

      const submission = item.submissions[0] ?? null;

      return {
        ...challenge,
        participated: item.participations.length > 0,
        hasSubmitted: submission !== null,
        submission: submission
          ? {
              id: submission.id,
              status: submission.status,
              submittedAt: submission.createdAt,
            }
          : null,
      };
    })
    .filter(
      (challenge) => challenge.status !== "CLOSED"
    );

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