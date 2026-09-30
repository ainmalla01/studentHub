import { z } from "zod";
import * as service from "src/services/submission.service.js";
import { ok } from "src/utils/response.js";
import { uuidParam } from "src/validators/common.js";
import {
  createSubmissionSchema,
  evaluateSubmissionSchema,
  submissionQuerySchema,
} from "src/validators/submission.validator.js";

const studentIdParam = z.object({ studentId: z.string().uuid() });
const challengeIdParam = z.object({ challengeId: z.string().uuid() });

// Students always submit as themselves - the student is taken from the token.
export const createSubmission = async (req, res) =>
  ok(
    res,
    await service.createSubmission(createSubmissionSchema.parse(req.body), req.student),
    "Submission created.",
    201,
  );

export const getSubmissions = async (req, res) =>
  ok(res, await service.getSubmissions(submissionQuerySchema.parse(req.query), req.user.collegeId));

export const getSubmission = async (req, res) =>
  ok(res, await service.getSubmissionById(uuidParam.parse(req.params).id, req.actor));

export const getStudentSubmissions = async (req, res) =>
  ok(
    res,
    await service.getStudentSubmissions(studentIdParam.parse(req.params).studentId, req.actor),
  );

export const getChallengeSubmissions = async (req, res) =>
  ok(
    res,
    await service.getChallengeSubmissions(
      challengeIdParam.parse(req.params).challengeId,
      req.user.collegeId,
    ),
  );

export const evaluateSubmission = async (req, res) =>
  ok(
    res,
    await service.evaluateSubmission(
      uuidParam.parse(req.params).id,
      req.user.collegeId,
      evaluateSubmissionSchema.parse(req.body),
    ),
    "Submission evaluated.",
  );

export const markUnderReview = async (req, res) =>
  ok(
    res,
    await service.markUnderReview(uuidParam.parse(req.params).id, req.user.collegeId),
    "Submission moved to review.",
  );

export const getStatistics = async (req, res) =>
  ok(res, await service.getSubmissionStatistics(req.user.collegeId));
