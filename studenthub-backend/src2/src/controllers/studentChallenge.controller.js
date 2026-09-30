import { z } from "zod";

import * as service from "../services/studentChallenge.service.js";

import { ok } from "../utils/response.js";

import {
  challengeQuerySchema,
} from "../validators/challenge.validator.js";


// ============================================================
// STUDENT PORTAL
// CHALLENGES & SUBMISSIONS CONTROLLER
// ============================================================


// ------------------------------------------------------------
// Shared
// Challenge ID Validation
// ------------------------------------------------------------

const idSchema = z.object({
  id: z.string().uuid(),
});

const challengeIdSchema = z.object({
  challengeId: z.string().uuid(),
});


// ============================================================
// STUDENT
// CHALLENGES
// ============================================================


// ------------------------------------------------------------
// View Published Challenges
// Search / Difficulty Filter
// ------------------------------------------------------------

export const getStudentChallenges = async (
  req,
  res
) => {

  console.log(
    "➡️ [CONTROLLER] getStudentChallenges hit"
  );

  console.log(
    "📋 Query:",
    req.query
  );

  console.log(
    "👤 Student ID:",
    req.user?.studentId
  );

  const parsedQuery =
    challengeQuerySchema.parse(
      req.query
    );

  const result =
    await service.getStudentChallenges(
      parsedQuery,
      req.user.studentId
    );

  return ok(
    res,
    result,
    "Student challenges fetched successfully."
  );
};


// ------------------------------------------------------------
// View Challenge Details
// ------------------------------------------------------------

export const getStudentChallenge = async (
  req,
  res
) => {

  const challengeId =
    idSchema.parse(req.params).id;

  console.log(
    "➡️ [CONTROLLER] getStudentChallenge hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  console.log(
    "👤 Student ID:",
    req.user?.studentId
  );

  const result =
    await service.getStudentChallenge(
      challengeId,
      req.user.studentId
    );

  return ok(
    res,
    result,
    "Challenge fetched successfully."
  );
};


// ------------------------------------------------------------
// Participate in Challenge
// ------------------------------------------------------------

export const participateInChallenge = async (
  req,
  res
) => {

  const challengeId =
    challengeIdSchema.parse(req.params).challengeId;

  const studentId =
    req.user.studentId;

  console.log(
    "➡️ [CONTROLLER] participateInChallenge hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  console.log(
    "👤 Student ID:",
    studentId
  );

  const result =
    await service.participateInChallenge(
      studentId,
      challengeId
    );

  return ok(
    res,
    result,
    "Successfully registered for participation."
  );
};


// ------------------------------------------------------------
// Check Participation
// ------------------------------------------------------------

export const checkParticipation = async (
  req,
  res
) => {

  const challengeId =
    challengeIdSchema.parse(req.params).challengeId;

  const studentId =
    req.user.studentId;

  console.log(
    "➡️ [CONTROLLER] checkParticipation hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  console.log(
    "👤 Student ID:",
    studentId
  );

  const participation =
    await service.checkParticipation(
      studentId,
      challengeId
    );

  return ok(
    res,
    participation,
    "Participation status retrieved successfully."
  );
};


// ============================================================
// STUDENT
// SUBMISSIONS
// ============================================================


// ------------------------------------------------------------
// My Submissions
// ------------------------------------------------------------

export const getMySubmissions = async (
  req,
  res
) => {

  const studentId =
    req.user.studentId;

  console.log(
    "➡️ [CONTROLLER] getMySubmissions hit"
  );

  console.log(
    "👤 Student ID:",
    studentId
  );

  const result =
    await service.getMySubmissions(
      studentId,
      req.query
    );

  return ok(
    res,
    result,
    "Submissions fetched successfully."
  );
};