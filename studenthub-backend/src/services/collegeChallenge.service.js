import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

import {
  includeChallenge,
  getChallengeById,
  formatChallenge,
  ensureChallengeExists,
} from "./challenge.service.js";

// ============================================================
// COLLEGE SIDE
// CHALLENGES
// ============================================================

// ============================================================
// CHALLENGE DISCOVERY
// ============================================================

// ------------------------------------------------------------
// Get College Challenges
// College → Challenges → List
// ------------------------------------------------------------

export const getCollegeChallenges = async (
  params,
  collegeId
) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    difficulty,
  } = params;

  const where = {
    collegeId,

    ...(status
      ? {
          status,
        }
      : {}),

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

  const [items, total] =
    await prisma.$transaction([
      prisma.challenge.findMany({
        where,

        include: includeChallenge,

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

  const result =
    items.map(formatChallenge);

  return {
    result,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(total / limit),
    },
  };
};

// ------------------------------------------------------------
// Get Single College Challenge
// College → Challenges → Challenge Details
// ------------------------------------------------------------

export const getCollegeChallenge = async (
  id,
  collegeId
) => {
  const challenge =
    await getChallengeById(
      id,
      {
        collegeId,
      },
      {
        submissions: {
          include: {
            student: true,

            evaluation: {
              include: {
                scores: {
                  include: {
                    rubric: true,
                  },
                },
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      }
    );

  const formatted =
    formatChallenge(challenge);

  return {
    challengeinfo: formatted,

    description:
      challenge.description,

    instruction:
      challenge.instructions,
  };
};

// ============================================================
// CREATE CHALLENGE
// ============================================================

// ------------------------------------------------------------
// Create Challenge
// College → Challenges → Create
// ------------------------------------------------------------

export const createChallenge = async (
  input,
  collegeId
) => {
  const {
    skillIds = [],
    departments,
    rubrics = [],
    startDate,
    deadline,
    ...data
  } = input;

  // ----------------------------------------------------------
  // Validate Dates
  // ----------------------------------------------------------

  if (!startDate || !deadline) {
    throw new AppError(
      400,
      "Both startDate and deadline are required."
    );
  }

  // ----------------------------------------------------------
  // Validate Rubrics
  // ----------------------------------------------------------

  if (!rubrics || rubrics.length === 0) {
    throw new AppError(
      400,
      "At least one rubric criterion is required."
    );
  }

  const rubricTotal =
    rubrics.reduce(
      (sum, rubric) =>
        sum + rubric.maxScore,
      0
    );

  if (rubricTotal !== 100) {
    throw new AppError(
      400,
      `Rubric total must equal 100. Current total is ${rubricTotal}.`
    );
  }

  // ----------------------------------------------------------
  // Parse YYYY-MM-DD
  // ----------------------------------------------------------

  const [
    startYear,
    startMonth,
    startDay,
  ] = startDate
    .split("-")
    .map(Number);

  const [
    endYear,
    endMonth,
    endDay,
  ] = deadline
    .split("-")
    .map(Number);

  // ----------------------------------------------------------
  // Start Of Start Date
  // ----------------------------------------------------------

  const start = new Date(
    startYear,
    startMonth - 1,
    startDay,
    0,
    0,
    0,
    0
  );

  // ----------------------------------------------------------
  // End Of Deadline Date
  // ----------------------------------------------------------

  const end = new Date(
    endYear,
    endMonth - 1,
    endDay,
    23,
    59,
    59,
    999
  );

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const deadlineDay = new Date(
    endYear,
    endMonth - 1,
    endDay,
    0,
    0,
    0,
    0
  );

  // ----------------------------------------------------------
  // Date Validation
  // ----------------------------------------------------------

  if (start > end) {
    throw new AppError(
      400,
      "Start date must be before or equal to the deadline."
    );
  }

  if (deadlineDay < today) {
    throw new AppError(
      400,
      "Deadline must be today or in the future."
    );
  }

  // ----------------------------------------------------------
  // Department Handling
  // ----------------------------------------------------------

  const finalDepartments =
    !departments ||
    departments.length === 0
      ? ["ALL"]
      : departments;

  // ----------------------------------------------------------
  // Create Challenge + Skills + Rubrics
  // ----------------------------------------------------------

  const challenge =
    await prisma.$transaction(
      async (tx) => {
        const createdChallenge =
          await tx.challenge.create({
            data: {
              ...data,

              startDate: start,

              deadline: end,

              collegeId,

              departments:
                finalDepartments,

              skills: {
                create: skillIds.map(
                  (skillId) => ({
                    skill: {
                      connect: {
                        id: skillId,
                      },
                    },
                  })
                ),
              },

              rubrics: {
                create: rubrics.map(
                  (rubric) => ({
                    name: rubric.name,

                    description:
                      rubric.description,

                    maxScore:
                      rubric.maxScore,
                  })
                ),
              },
            },

            include: includeChallenge,
          });

        return createdChallenge;
      }
    );

  return challenge;
};

// ============================================================
// UPDATE CHALLENGE
// ============================================================

// ------------------------------------------------------------
// Update Challenge
// College → Challenges → Edit
// ------------------------------------------------------------

export const updateChallenge = async (
  id,
  collegeId,
  input
) => {
  const existing =
    await ensureChallengeExists(
      id,
      {
        collegeId,
      }
    );

  const {
    skillIds,
    departments,
    rubrics,
    startDate,
    deadline,
    ...data
  } = input;

  // ----------------------------------------------------------
  // Calculate New Dates
  // ----------------------------------------------------------

  const newStart = startDate
    ? new Date(startDate)
    : existing.startDate;

  const newEnd = deadline
    ? new Date(deadline)
    : existing.deadline;

  // ----------------------------------------------------------
  // Validate Dates
  // ----------------------------------------------------------

  if (newStart >= newEnd) {
    throw new AppError(
      400,
      "Start date must be before the deadline."
    );
  }

  if (
    deadline &&
    new Date(deadline) <= new Date() &&
    existing.status !== "CLOSED"
  ) {
    throw new AppError(
      400,
      "Deadline must be in the future."
    );
  }

  // ----------------------------------------------------------
  // Transaction
  // ----------------------------------------------------------

  return prisma.$transaction(
    async (tx) => {
      // ------------------------------------------------------
      // Update Skills
      // ------------------------------------------------------

      if (skillIds) {
        await tx.challengeSkill.deleteMany({
          where: {
            challengeId: id,
          },
        });

        if (skillIds.length > 0) {
          await tx.challengeSkill.createMany({
            data: skillIds.map(
              (skillId) => ({
                challengeId: id,
                skillId,
              })
            ),
          });
        }
      }

      // ------------------------------------------------------
      // Update Rubrics
      // ------------------------------------------------------

      if (rubrics) {
        const rubricTotal =
          rubrics.reduce(
            (sum, rubric) =>
              sum + rubric.maxScore,
            0
          );

        if (rubricTotal !== 100) {
          throw new AppError(
            400,
            `Rubric total must equal 100. Current total is ${rubricTotal}.`
          );
        }

        await tx.rubric.deleteMany({
          where: {
            challengeId: id,
          },
        });

        await tx.rubric.createMany({
          data: rubrics.map(
            (rubric) => ({
              challengeId: id,

              name: rubric.name,

              description:
                rubric.description,

              maxScore:
                rubric.maxScore,
            })
          ),
        });
      }

      // ------------------------------------------------------
      // Prepare Challenge Update
      // ------------------------------------------------------

      const updateData = {
        ...data,
      };

      if (startDate) {
        updateData.startDate =
          newStart;
      }

      if (deadline) {
        updateData.deadline =
          newEnd;
      }

      if (departments) {
        updateData.departments =
          departments.length === 0
            ? ["ALL"]
            : departments;
      }

      // ------------------------------------------------------
      // Update Challenge
      // ------------------------------------------------------

      return tx.challenge.update({
        where: {
          id,
        },

        data: updateData,

        include: includeChallenge,
      });
    }
  );
};

// ============================================================
// PUBLISH CHALLENGE
// ============================================================

// ------------------------------------------------------------
// Publish Challenge
// College → Challenges → Publish
// ------------------------------------------------------------

export const publishChallenge = async (
  id,
  collegeId
) => {
  const challenge =
    await prisma.challenge.findFirst({
      where: {
        id,
        collegeId,
      },

      include: {
        rubrics: true,
      },
    });

  if (!challenge) {
    throw new AppError(
      404,
      "Challenge not found."
    );
  }

  // ----------------------------------------------------------
  // Closed Challenge
  // ----------------------------------------------------------

  if (challenge.status === "CLOSED") {
    throw new AppError(
      400,
      "A closed challenge cannot be published."
    );
  }

  // ----------------------------------------------------------
  // Validate Rubrics
  // ----------------------------------------------------------

  if (
    !challenge.rubrics ||
    challenge.rubrics.length === 0
  ) {
    throw new AppError(
      400,
      "Challenge must have at least one rubric before publishing."
    );
  }

  const rubricTotal =
    challenge.rubrics.reduce(
      (sum, rubric) =>
        sum + rubric.maxScore,
      0
    );

  if (rubricTotal !== 100) {
    throw new AppError(
      400,
      `Rubric total must equal 100. Current total is ${rubricTotal}.`
    );
  }

  // ----------------------------------------------------------
  // Publish
  // ----------------------------------------------------------

  return prisma.challenge.update({
    where: {
      id,
    },

    data: {
      status: "PUBLISHED",
    },

    include: includeChallenge,
  });
};

// ============================================================
// CLOSE CHALLENGE
// ============================================================

// ------------------------------------------------------------
// Close Challenge
// College → Challenges → Close
// ------------------------------------------------------------

export const closeChallenge = async (
  id,
  collegeId
) => {
  const challenge =
    await ensureChallengeExists(
      id,
      {
        collegeId,
      }
    );

  if (challenge.status === "CLOSED") {
    throw new AppError(
      400,
      "Challenge is already closed."
    );
  }

  return prisma.challenge.update({
    where: {
      id,
    },

    data: {
      status: "CLOSED",
    },

    include: includeChallenge,
  });
};

// ============================================================
// DELETE CHALLENGE
// ============================================================

// ------------------------------------------------------------
// Delete Challenge
// College → Challenges → Delete
// ------------------------------------------------------------

export const deleteChallenge = async (
  id,
  collegeId
) => {
  await ensureChallengeExists(
    id,
    {
      collegeId,
    }
  );

  return prisma.challenge.delete({
    where: {
      id,
    },
  });
};