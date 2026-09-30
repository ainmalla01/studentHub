import * as service from "src/services/collegeChallenge.service.js";
import { ok } from "src/utils/response.js";
import {
  challengeQuerySchema,
  createChallengeSchema,
  updateChallengeSchema,
} from "src/validators/challenge.validator.js";
import { uuidParam } from "src/validators/common.js";

const idOf = (req) => uuidParam.parse(req.params).id;

export const createChallenge = async (req, res) =>
  ok(
    res,
    await service.createChallenge(createChallengeSchema.parse(req.body), req.user.collegeId),
    "Challenge created.",
    201,
  );

export const getCollegeChallenges = async (req, res) =>
  ok(
    res,
    await service.getCollegeChallenges(challengeQuerySchema.parse(req.query), req.user.collegeId),
    "College challenges fetched successfully.",
  );

export const getCollegeChallenge = async (req, res) =>
  ok(
    res,
    await service.getCollegeChallenge(idOf(req), req.user.collegeId),
    "Challenge fetched successfully.",
  );

export const updateChallenge = async (req, res) =>
  ok(
    res,
    await service.updateChallenge(
      idOf(req),
      req.user.collegeId,
      updateChallengeSchema.parse(req.body),
    ),
    "Challenge updated.",
  );

export const publishChallenge = async (req, res) =>
  ok(res, await service.publishChallenge(idOf(req), req.user.collegeId), "Challenge published.");

export const closeChallenge = async (req, res) =>
  ok(res, await service.closeChallenge(idOf(req), req.user.collegeId), "Challenge closed.");

export const deleteChallenge = async (req, res) => {
  await service.deleteChallenge(idOf(req), req.user.collegeId);
  return res.status(204).send();
};
