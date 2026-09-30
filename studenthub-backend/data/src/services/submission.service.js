import { prisma } from "src/config/prisma.js";
import { AppError } from "src/utils/AppError.js";
import { visibleDepartmentsFor } from "src/utils/departments.js";
import { buildPagination, skipTake } from "src/utils/pagination.js";
import { recomputeStudentSkills } from "src/services/skillProgress.service.js";

const includeSubmission = {
  student: true,
  challenge: { include: { skills: { include: { skill: true } } } },
  evaluation: true,
};

/** A submission is only visible to the college that owns its challenge. */
const findForCollege = async (id, collegeId) => {
  const submission = await prisma.submission.findFirst({
    where: { id, challenge: { collegeId } },
    include: includeSubmission,
  });
  if (!submission) throw new AppError(404, "Submission not found.");
  return submission;
};

export const createSubmission = async (input, student) => {
  const challenge = await prisma.challenge.findFirst({
    where: {
      id: input.challengeId,
      collegeId: student.collegeId,
      departments: { hasSome: visibleDepartmentsFor(student.department) },
    },
  });
  if (!challenge) throw new AppError(404, "Challenge not found.");
  if (challenge.status !== "PUBLISHED") {
    throw new AppError(400, "This challenge is not accepting submissions.");
  }
  if (challenge.deadline < new Date()) throw new AppError(400, "The challenge deadline has passed.");

  const { githubLink, fileUrl } = input;
  if (challenge.submissionType === "GITHUB_LINK" && !githubLink) {
    throw new AppError(400, "GitHub link is required for this challenge.");
  }
  if (challenge.submissionType === "FILE_UPLOAD" && !fileUrl) {
    throw new AppError(400, "File URL is required for this challenge.");
  }
  if (challenge.submissionType === "BOTH" && (!githubLink || !fileUrl)) {
    throw new AppError(400, "Both GitHub link and file URL are required.");
  }

  const existing = await prisma.submission.findUnique({
    where: { studentId_challengeId: { studentId: student.id, challengeId: challenge.id } },
    select: { id: true },
  });
  if (existing) throw new AppError(409, "You have already submitted work for this challenge.");

  // Submitting implies participating, so make sure the participation row exists.
  return prisma.$transaction(async (tx) => {
    await tx.challengeParticipate.upsert({
      where: { studentId_challengeId: { studentId: student.id, challengeId: challenge.id } },
      create: { studentId: student.id, challengeId: challenge.id },
      update: {},
    });

    return tx.submission.create({
      data: {
        studentId: student.id,
        challengeId: challenge.id,
        githubLink: githubLink || null,
        fileUrl: fileUrl || null,
        description: input.description || null,
      },
      include: includeSubmission,
    });
  });
};

export const getSubmissions = async (params, collegeId) => {
  const { page, limit, status, challengeId, studentId } = params;

  const where = {
    challenge: { collegeId },
    ...(status ? { status } : {}),
    ...(challengeId ? { challengeId } : {}),
    ...(studentId ? { studentId } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where,
      include: includeSubmission,
      orderBy: { createdAt: "desc" },
      ...skipTake({ page, limit }),
    }),
    prisma.submission.count({ where }),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }) };
};

export const getSubmissionById = async (id, actor) => {
  const submission = await findForCollege(id, actor.collegeId);
  if (actor.role === "STUDENT" && submission.studentId !== actor.studentId) {
    throw new AppError(404, "Submission not found.");
  }
  return submission;
};

export const getStudentSubmissions = async (studentId, actor) => {
  if (actor.role === "STUDENT" && actor.studentId !== studentId) {
    throw new AppError(403, "You do not have permission to view these submissions.");
  }

  return prisma.submission.findMany({
    where: { studentId, challenge: { collegeId: actor.collegeId } },
    include: includeSubmission,
    orderBy: { createdAt: "desc" },
  });
};

export const getChallengeSubmissions = (challengeId, collegeId) =>
  prisma.submission.findMany({
    where: { challengeId, challenge: { collegeId } },
    include: includeSubmission,
    orderBy: { createdAt: "desc" },
  });

export const evaluateSubmission = async (id, collegeId, input) => {
  const submission = await findForCollege(id, collegeId);

  const total = input.functionality + input.codeQuality + input.documentation + input.problemSolving;

  return prisma.$transaction(async (tx) => {
    await tx.evaluation.upsert({
      where: { submissionId: id },
      create: { submissionId: id, ...input, total },
      update: { ...input, total },
    });

    const updated = await tx.submission.update({
      where: { id },
      data: { status: "EVALUATED", score: total, feedback: input.feedback ?? null },
      include: includeSubmission,
    });

    await recomputeStudentSkills(tx, submission.studentId);
    return updated;
  });
};

export const markUnderReview = async (id, collegeId) => {
  const submission = await findForCollege(id, collegeId);

  if (submission.status === "EVALUATED") {
    throw new AppError(409, "This submission has already been evaluated.");
  }
  if (submission.status === "UNDER_REVIEW") return submission;

  return prisma.submission.update({
    where: { id },
    data: { status: "UNDER_REVIEW" },
    include: includeSubmission,
  });
};

export const getSubmissionStatistics = async (collegeId) => {
  const challenge = { collegeId };

  const [submitted, underReview, evaluated, average] = await Promise.all([
    prisma.submission.count({ where: { challenge, status: "SUBMITTED" } }),
    prisma.submission.count({ where: { challenge, status: "UNDER_REVIEW" } }),
    prisma.submission.count({ where: { challenge, status: "EVALUATED" } }),
    prisma.submission.aggregate({
      where: { challenge, score: { not: null } },
      _avg: { score: true },
    }),
  ]);

  return {
    submitted,
    underReview,
    evaluated,
    averageScore: Number((average._avg.score ?? 0).toFixed(2)),
  };
};
