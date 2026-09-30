import { z } from "zod";

import * as service from "../services/submission.service.js";

import { ok } from "../utils/response.js";

import {
  createSubmissionSchema,
  evaluateSubmissionSchema,
  submissionQuery 
} from "../validators/submission.validator.js";
import {uuidParam} from '../validators/common.js'

// ============================================================
// SUBMISSION CONTROLLER
// ============================================================



// ============================================================
// STUDENT PORTAL
// SUBMISSIONS
// ============================================================


// ------------------------------------------------------------
// Submit Work
// ------------------------------------------------------------

export const createSubmission = async (req, res) => {

  const data =createSubmissionSchema.parse(req.body);
  const params=uuidParam.parse(req.params);
  ok(
    res,
    await service.createSubmission(req.user.studentId,data,params.id),
    "Submission created.",
    201
  );
};


// ------------------------------------------------------------
// My Submissions
// ------------------------------------------------------------

export const getStudentSubmissions = async (
  req,
  res
) =>
  ok(
    res,
    await service.getStudentSubmissions(
      z
        .object({
          studentId: z.string().uuid(),
        })
        .parse(req.params)
        .studentId
    )
  );


// ============================================================
// COLLEGE PORTAL
// SUBMISSIONS
// ============================================================


// ------------------------------------------------------------
// View / Filter Submissions
// ------------------------------------------------------------

export const getSubmissions = async (
  req,
  res
) =>
  ok(
    res,
    await service.getSubmissions(
      submissionQuery.parse(req.query)
    )
  );


// ------------------------------------------------------------
// View Submission Details
// ------------------------------------------------------------

export const getSubmission = async (
  req,
  res
) =>
  ok(
    res,
    await service.getSubmissionById(
      uuidParam.parse(req.params).id
    )
  );


// ------------------------------------------------------------
// View Challenge Submissions
// ------------------------------------------------------------

export const getChallengeSubmissions = async (
  req,
  res
) =>
  ok(
    res,
    await service.getChallengeSubmissions(
      z
        .object({
          challengeId: z.string().uuid(),
        })
        .parse(req.params)
        .challengeId
    )
  );


// ------------------------------------------------------------
// Mark Submission Under Review
// ------------------------------------------------------------

export const markUnderReview = async (
  req,
  res
) =>
  ok(
    res,
    await service.markUnderReview(
      idSchema.parse(req.params).id
    ),
    "Submission moved to review."
  );


// ------------------------------------------------------------
// Evaluate Submission
// ------------------------------------------------------------

export const evaluateSubmission = async (
  req,
  res
) =>
  ok(
    res,
    await service.evaluateSubmission(
      uuidParam.parse(req.params).id,
      evaluateSubmissionSchema.parse(req.body)
    ),
    "Submission evaluated."
  );


// ------------------------------------------------------------
// Submission Statistics
// ------------------------------------------------------------

export const getStatistics = async (
  _req,
  res
) =>
  ok(
    res,
    await service.getSubmissionStatistics()
  );