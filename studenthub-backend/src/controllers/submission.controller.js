
import { z } from "zod";

import * as service from "../services/submission.service.js";

import { AppError } from "../utils/AppError.js";
import { ok } from "../utils/response.js";

import {
  createSubmissionSchema,
  evaluateSubmissionSchema,
  submissionQuery,
} from "../validators/submission.validator.js";

import { uuidParam } from "../validators/common.js";
import {
  verifySubmission as verifySubmissionService,
} from "../services/submission.service.js";

export const createSubmission = async (req, res) => {
  const data = createSubmissionSchema.parse(req.body);
  const { id: challengeId } = uuidParam.parse(req.params);

  const studentId = req.user?.studentId;

  if (!studentId) {
    throw new AppError(
      403,
      "Student ID not found in authentication."
    );
  }

  const submission = await service.createSubmission(
    studentId,
    data,
    challengeId
  );

  return ok(
    res,
    submission,
    "Submission created.",
    201
  );
};


export const getMySubmissions = async (req, res) => {
  const studentId = req.user?.studentId;

  if (!studentId) {
    throw new AppError(
      403,
      "Student ID not found in authentication."
    );
  }

  const submissions =
    await service.getStudentSubmissions(studentId);

  return ok(
    res,
    submissions,
    "Student submissions retrieved successfully."
  );
};


export const getSubmissions = async (req, res) => {
  const query = submissionQuery.parse(req.query);

  const submissions =
    await service.getSubmissions(query);

  return ok(
    res,
    submissions,
    "Submissions retrieved successfully."
  );
};


export const getStudentSubmissions = async (
  req,
  res
) => {
  const { studentId } = z
    .object({
      studentId: z.string().uuid(),
    })
    .parse(req.params);

  const submissions =
    await service.getStudentSubmissions(studentId);

  return ok(
    res,
    submissions,
    "Student submissions retrieved successfully."
  );
};

// ------------------------------------------------------------
// View Single Submission Details
// GET /api/submissions/:id
// ------------------------------------------------------------
export const getSubmission = async (req, res) => {
  const { id } = uuidParam.parse(req.params);

  const submission =
    await service.getSubmissionById(id);

  return ok(
    res,
    submission,
    "Submission retrieved successfully."
  );
};

// ------------------------------------------------------------
// View Challenge Submissions
// GET /api/submissions/challenge/:challengeId
// ------------------------------------------------------------
export const getChallengeSubmissions = async (
  req,
  res
) => {
  const { challengeId } = z
    .object({
      challengeId: z.string().uuid(),
    })
    .parse(req.params);

  const submissions =
    await service.getChallengeSubmissions(
      challengeId
    );

  return ok(
    res,
    submissions,
    "Challenge submissions retrieved successfully."
  );
};

// ------------------------------------------------------------
// Mark Submission Under Review
// PATCH /api/submissions/:id/review
// ------------------------------------------------------------
export const markUnderReview = async (
  req,
  res
) => {
  const { id } = uuidParam.parse(req.params);

  const submission =
    await service.markUnderReview(id);

  return ok(
    res,
    submission,
    "Submission moved to review."
  );
};

// ------------------------------------------------------------
// Evaluate Submission
// PATCH /api/submissions/:id/evaluate
// ------------------------------------------------------------
export const evaluateSubmission = async (
  req,
  res
) => {
  const { id } = uuidParam.parse(req.params);

  const data =
    evaluateSubmissionSchema.parse(req.body);

  const result =
    await service.evaluateSubmission(id, data);

  return ok(
    res,
    result,
    "Submission evaluated successfully."
  );
};

// ------------------------------------------------------------
// Submission Statistics
// GET /api/submissions/statistics
// ------------------------------------------------------------
export const getStatistics = async (
  _req,
  res
) => {
  const statistics =
    await service.getSubmissionStatistics();

  return ok(
    res,
    statistics,
    "Submission statistics retrieved successfully."
  );
};


export const verifySubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const evaluation = await verifySubmissionService(id);

    return res.status(200).json({
      success: true,
      message: "Submission verified successfully.",
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};