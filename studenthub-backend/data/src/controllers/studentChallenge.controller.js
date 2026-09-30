import { z } from "zod";
import * as service from "src/services/studentChallenge.service.js";
import { ok } from "src/utils/response.js";
import { challengeQuerySchema } from "src/validators/challenge.validator.js";
import { uuidParam } from "src/validators/common.js";

const challengeIdParam = z.object({ challengeId: z.string().uuid() });

export const getStudentChallenges = async (req, res) =>
  ok(
    res,
    await service.getStudentChallenges(challengeQuerySchema.parse(req.query), req.student),
    "Student challenges fetched successfully.",
  );

export const getStudentChallenge = async (req, res) =>
  ok(
    res,
    await service.getStudentChallenge(uuidParam.parse(req.params).id, req.student),
    "Challenge fetched successfully.",
  );

export const participateInChallenge = async (req, res) =>
  ok(
    res,
    await service.participateInChallenge(
      req.student,
      challengeIdParam.parse(req.params).challengeId,
    ),
    "Successfully registered for participation.",
  );

export const checkParticipation = async (req, res) =>
  ok(
    res,
    await service.checkParticipation(req.student.id, challengeIdParam.parse(req.params).challengeId),
    "Participation status retrieved successfully.",
  );

export const getMySubmissions = async (req, res) =>
  ok(res, await service.getMySubmissions(req.student.id), "Submissions fetched successfully.");

export const getDashboard = async (req, res) =>
  ok(res, await service.getStudentDashboard(req.student), "Dashboard fetched successfully.");
