import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { calculateChallengeStatus } from "../utils/calculateChallengeStatus.js";

// ============================================================
// SHARED CHALLENGE SERVICE
// ============================================================

// ------------------------------------------------------------
// Shared Challenge Include
// ------------------------------------------------------------

export const includeChallenge = {
  skills: {
    include: {
      skill: true,
    },
  },

  rubrics: {
    orderBy: {
      createdAt: "asc",
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
// Get Challenge By ID
// ------------------------------------------------------------

export const getChallengeById = async (
  id,
  where = {},
  additionalInclude = {}
) => {
  const challenge = await prisma.challenge.findFirst({
    where: {
      id:id
    },

    include: {
      ...includeChallenge,
      ...additionalInclude,
    },
  });
  

  if (!challenge) {
    throw new AppError(404, "Challenge not found.");
  }

  return challenge;
};

// ------------------------------------------------------------
// Format Challenge
// ------------------------------------------------------------

export const formatChallenge = (challenge) => {
  const {
    _count,
    ...rest
  } = challenge;

  const computedStatus =
    calculateChallengeStatus(challenge);

  return {
    ...rest,

    status: computedStatus,

    totalParticipation:
      _count?.participations || 0,

    totalSubmissions:
      _count?.submissions || 0,
  };
};

// ------------------------------------------------------------
// Format Challenge With Participation
// ------------------------------------------------------------

export const formatStudentChallenge = (
  challenge
) => {
  const formatted =
    formatChallenge(challenge);

  return {
    ...formatted,

    participated:
      challenge.participations?.length > 0,
  };
};

// ------------------------------------------------------------
// Validate Challenge Exists
// ------------------------------------------------------------

export const ensureChallengeExists = async (
  id,
  where = {}
) => {
  const challenge =
    await prisma.challenge.findFirst({
      where: {
        id,
        ...where,
      },
    });

  if (!challenge) {
    throw new AppError(
      404,
      "Challenge not found."
    );
  }

  return challenge;
};