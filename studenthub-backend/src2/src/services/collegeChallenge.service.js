import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";


// ============================================================
// COLLEGE SIDE
// CHALLENGE MANAGEMENT
// ============================================================


// ------------------------------------------------------------
// Shared Challenge Include
// Used by College Challenge operations
// ------------------------------------------------------------

const includeChallenge = {
  skills: {
    include: {
      skill: true,
    },
  },

  _count: {
    select: {
      submissions: true,
      participations: true,
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


// ------------------------------------------------------------
// Get College Challenges
// College → Challenges → List
// ------------------------------------------------------------

export const getCollegeChallenges = async (params, collegeId) => {
  const {
    page,
    limit,
    search,
    status,
    difficulty,
  } = params;

  const where = {
    collegeId,

    ...(status ? { status } : {}),

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
  };

  const [items, total] = await prisma.$transaction([
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

  const result = items.map(({ _count, ...challenge }) => {
    const computedStatus = calculateChallengeStatus(challenge);

    return {
      ...challenge,
      status: computedStatus,

      totalParticipation: _count.participations,
      totalSubmissions: _count.submissions,
    };
  });

  return {
    result,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


// ------------------------------------------------------------
// Get Single College Challenge
// College → Challenges → Challenge Details
// ------------------------------------------------------------

export const getCollegeChallenge = async (id, collegeId) => {
  const challenge = await prisma.challenge.findFirst({
    where: {
      id,
      collegeId,
    },

    include: {
      ...includeChallenge,

      submissions: {
        include: {
          student: true,
          evaluation: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!challenge) {
    throw new AppError(404, "Challenge not found.");
  }

  const {
    _count,
    ...rest
  } = challenge;

  const computedStatus = calculateChallengeStatus(challenge);

  return {
    challengeinfo: {
      ...rest,
      status: computedStatus,

      totalParticipation: _count?.participations || 0,
      totalSubmissions: _count?.submissions || 0,
    },

    description: challenge.description,
    instruction: challenge.instructions,
  };
};


// ------------------------------------------------------------
// Create Challenge
// College → Challenges → Create
// ------------------------------------------------------------

export const createChallenge = async (input, collegeId) => {
  const {
    skillIds = [],
    departments,
    startDate,
    deadline,
    ...data
  } = input;

  if (!startDate || !deadline) {
    throw new AppError(
      400,
      "Both startDate and deadline are required."
    );
  }

  // Parse YYYY-MM-DD strings directly to prevent timezone shifts
  const [
    startYear,
    startMonth,
    startDay,
  ] = startDate.split("-").map(Number);

  const [
    endYear,
    endMonth,
    endDay,
  ] = deadline.split("-").map(Number);

  // Start at the beginning of the start day
  const start = new Date(
    startYear,
    startMonth - 1,
    startDay,
    0,
    0,
    0,
    0
  );

  // End at the very end of the deadline day
  // so the deadline day is inclusive
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

  const finalDepartments =
    !departments || departments.length === 0
      ? ["ALL"]
      : departments;

  const challenge = await prisma.challenge.create({
    data: {
      ...data,

      startDate: start,
      deadline: end,

      collegeId,

      departments: finalDepartments,

      skills: {
        create: skillIds.map((skillId) => ({
          skill: {
            connect: {
              id: skillId,
            },
          },
        })),
      },
    },

    include: includeChallenge,
  });

  return challenge;
};


// ------------------------------------------------------------
// Update Challenge
// College → Challenges → Edit
// ------------------------------------------------------------

export const updateChallenge = async (
  id,
  collegeId,
  input
) => {
  const existing = await prisma.challenge.findFirst({
    where: {
      id,
      collegeId,
    },
  });

  if (!existing) {
    throw new AppError(
      404,
      "Challenge not found."
    );
  }

  const {
    skillIds,
    departments,
    startDate,
    deadline,
    ...data
  } = input;

  const newStart = startDate
    ? new Date(startDate)
    : existing.startDate;

  const newEnd = deadline
    ? new Date(deadline)
    : existing.deadline;

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

  return prisma.$transaction(async (tx) => {

    if (skillIds) {
      await tx.challengeSkill.deleteMany({
        where: {
          challengeId: id,
        },
      });

      await tx.challengeSkill.createMany({
        data: skillIds.map((skillId) => ({
          challengeId: id,
          skillId,
        })),
      });
    }

    const updateData = {
      ...data,
    };

    if (startDate) {
      updateData.startDate = newStart;
    }

    if (deadline) {
      updateData.deadline = newEnd;
    }

    if (departments) {
      updateData.departments =
        departments.length === 0
          ? ["ALL"]
          : departments;
    }

    return tx.challenge.update({
      where: {
        id,
      },

      data: updateData,

      include: includeChallenge,
    });
  });
};


// ------------------------------------------------------------
// Publish Challenge
// College → Challenges → Publish
// ------------------------------------------------------------

export const publishChallenge = async (
  id,
  collegeId
) => {
  const challenge = await prisma.challenge.findFirst({
    where: {
      id,
      collegeId,
    },
  });

  if (!challenge) {
    throw new AppError(
      404,
      "Challenge not found."
    );
  }

  if (challenge.status === "CLOSED") {
    throw new AppError(
      400,
      "A closed challenge cannot be published."
    );
  }

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


// ------------------------------------------------------------
// Close Challenge
// College → Challenges → Close
// ------------------------------------------------------------

export const closeChallenge = async (
  id,
  collegeId
) => {
  const challenge = await prisma.challenge.findFirst({
    where: {
      id,
      collegeId,
    },
  });

  if (!challenge) {
    throw new AppError(
      404,
      "Challenge not found."
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


// ------------------------------------------------------------
// Delete Challenge
// College → Challenges → Delete
// ------------------------------------------------------------

export const deleteChallenge = async (
  id,
  collegeId
) => {
  const challenge = await prisma.challenge.findFirst({
    where: {
      id,
      collegeId,
    },
  });

  if (!challenge) {
    throw new AppError(
      404,
      "Challenge not found."
    );
  }

  return prisma.challenge.delete({
    where: {
      id,
    },
  });
};