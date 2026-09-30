import { prisma } from "../config/prisma.js";

import { AppError } from "./AppError.js";

// ============================================================
// SUBMISSION ELIGIBILITY
// ============================================================

export const checkSubmissionEligibility =
  async (
    studentId,
    challengeId
  ) => {
    // ----------------------------------------------------------
    // 1. Check challenge exists
    // ----------------------------------------------------------

    const challenge =
      await prisma.challenge.findUnique({
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
    // 2. Challenge must be published
    // ----------------------------------------------------------

    if (
      challenge.status !== "PUBLISHED"
    ) {
      throw new AppError(
        400,
        "This challenge is not available for submission."
      );
    }

    // ----------------------------------------------------------
    // 3. Check challenge dates
    // ----------------------------------------------------------

    const now = new Date();

    const startDate =
      new Date(challenge.startDate);

    const deadline =
      new Date(challenge.deadline);

    if (now < startDate) {
      throw new AppError(
        400,
        "This challenge has not started yet."
      );
    }

    if (now > deadline) {
      throw new AppError(
        400,
        "The submission deadline has passed."
      );
    }

    // ----------------------------------------------------------
    // 4. Check student participation
    // ----------------------------------------------------------

    const participation =
      await prisma.challengeParticipate.findUnique(
        {
          where: {
            studentId_challengeId: {
              studentId,
              challengeId,
            },
          },
        }
      );

    if (!participation) {
      throw new AppError(
        403,
        "You must participate in this challenge before submitting."
      );
    }

    // ----------------------------------------------------------
    // 5. Check existing submission
    // ----------------------------------------------------------

    const existingSubmission =
      await prisma.submission.findUnique({
        where: {
          studentId_challengeId: {
            studentId,
            challengeId,
          },
        },
      });

    if (existingSubmission) {
      return {
        canSubmit: false,
        alreadySubmitted: true,
        submission:
          existingSubmission,
      };
    }

    // ----------------------------------------------------------
    // 6. Eligible
    // ----------------------------------------------------------

    return {
      canSubmit: true,
      alreadySubmitted: false,
      challenge,
    };
  };