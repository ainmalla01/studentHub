import { z } from "zod";

import * as service from "../services/collegeChallenge.service.js";

import { ok } from "../utils/response.js";

import {
  challengeQuerySchema,
  createChallengeSchema,
  updateChallengeSchema,
} from "../validators/challenge.validator.js";


// ============================================================
// COLLEGE PORTAL
// CHALLENGES CONTROLLER
// ============================================================


// ------------------------------------------------------------
// Shared
// Challenge ID Validation
// ------------------------------------------------------------

const idSchema = z.object({
  id: z.string().uuid(),
});


// ============================================================
// CHALLENGES
// ============================================================


// ------------------------------------------------------------
// Create Challenge
// ------------------------------------------------------------

export const createChallenge = async (req, res) => {
  console.log("➡️ [CONTROLLER] createChallenge hit");

  console.log(
    "📦 Request Body:",
    JSON.stringify(req.body, null, 2)
  );

  console.log(
    "👤 College ID:",
    req.user?.collegeId
  );

  const parsedData = createChallengeSchema.parse(
    req.body
  );

  const result = await service.createChallenge(
    parsedData,
    req.user.collegeId
  );

  console.log(
    "🎉 Challenge created successfully."
  );

  return ok(
    res,
    result,
    "Challenge created.",
    201
  );
};


// ------------------------------------------------------------
// Get College Challenges
// ------------------------------------------------------------

export const getCollegeChallenges = async (req, res) => {
  console.log(
    "➡️ [CONTROLLER] getCollegeChallenges hit"
  );

  console.log(
    "📋 Query:",
    req.query
  );

  console.log(
    "👤 College ID:",
    req.user?.collegeId
  );

  const parsedQuery = challengeQuerySchema.parse(
    req.query
  );

  const result = await service.getCollegeChallenges(
    parsedQuery,
    req.user.collegeId
  );

  return ok(
    res,
    result,
    "College challenges fetched successfully."
  );
};


// ------------------------------------------------------------
// Get College Challenge Details
// ------------------------------------------------------------

export const getCollegeChallenge = async (req, res) => {
  const challengeId = idSchema.parse(
    req.params
  ).id;

  console.log(
    "➡️ [CONTROLLER] getCollegeChallenge hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  console.log(
    "👤 College ID:",
    req.user?.collegeId
  );

  const result = await service.getCollegeChallenge(
    challengeId,
    req.user.collegeId
  );

  return ok(
    res,
    result,
    "Challenge fetched successfully."
  );
};


// ------------------------------------------------------------
// Update Challenge
// ------------------------------------------------------------

export const updateChallenge = async (req, res) => {
  const challengeId = idSchema.parse(
    req.params
  ).id;

  console.log(
    "➡️ [CONTROLLER] updateChallenge hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  console.log(
    "📦 Update Body:",
    JSON.stringify(req.body, null, 2)
  );

  const parsedData = updateChallengeSchema.parse(
    req.body
  );

  const result = await service.updateChallenge(
    challengeId,
    req.user.collegeId,
    parsedData
  );

  console.log(
    "🎉 Challenge updated successfully."
  );

  return ok(
    res,
    result,
    "Challenge updated."
  );
};


// ------------------------------------------------------------
// Publish Challenge
// ------------------------------------------------------------

export const publishChallenge = async (req, res) => {
  const challengeId = idSchema.parse(
    req.params
  ).id;

  console.log(
    "➡️ [CONTROLLER] publishChallenge hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  const result = await service.publishChallenge(
    challengeId,
    req.user.collegeId
  );

  return ok(
    res,
    result,
    "Challenge published."
  );
};


// ------------------------------------------------------------
// Close Challenge
// ------------------------------------------------------------

export const closeChallenge = async (req, res) => {
  const challengeId = idSchema.parse(
    req.params
  ).id;

  console.log(
    "➡️ [CONTROLLER] closeChallenge hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  const result = await service.closeChallenge(
    challengeId,
    req.user.collegeId
  );

  return ok(
    res,
    result,
    "Challenge closed."
  );
};


// ------------------------------------------------------------
// Delete Challenge
// ------------------------------------------------------------

export const deleteChallenge = async (req, res) => {
  const challengeId = idSchema.parse(
    req.params
  ).id;

  console.log(
    "➡️ [CONTROLLER] deleteChallenge hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  await service.deleteChallenge(
    challengeId,
    req.user.collegeId
  );

  console.log(
    "🗑️ Challenge deleted successfully."
  );

  return res.status(204).send();
};