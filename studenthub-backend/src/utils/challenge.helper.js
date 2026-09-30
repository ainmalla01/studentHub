import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const checkSubmissionEligibility = async (
  studentId,
  challengeId
) => {
  const challenge = await prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
  });

  if (!challenge) {
    throw new AppError(404, "Challenge not found.");
  }

  // Challenge must be published
  if (challenge.status !== "PUBLISHED") {
    throw new AppError(
      400,
      "This challenge is not available for submission."
    );
  }

  const now = new Date();
  const startDate = new Date(challenge.startDate);
  const deadline = new Date(challenge.deadline);

  // Challenge must currently be active
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

  // Student must have participated
  const participation =
    await prisma.challengeParticipate.findUnique({
      where: {
        studentId_challengeId: {
          studentId,
          challengeId,
        },
      },
    });

  if (!participation) {
    throw new AppError(
      403,
      "You must participate in this challenge before submitting."
    );
  }

  // Check whether student already submitted
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
      submission: existingSubmission,
    };
  }

  return {
    canSubmit: true,
    alreadySubmitted: false,
    challenge,
  };
};