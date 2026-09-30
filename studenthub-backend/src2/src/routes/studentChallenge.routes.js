import { Router } from "express";

import * as c from "../controllers/studentChallenge.controller.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Student challenge list
router.get(
  "/challenges",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(c.getStudentChallenges)
);

// Student challenge details
router.get(
  "/challenges/:id",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(c.getStudentChallenge)
);

// Participate in challenge
router.post(
  "/challenges/:challengeId/participate",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(c.participateInChallenge)
);

// Check student's participation
router.get(
  "/challenges/:challengeId/participation",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(c.checkParticipation)
);

// Student submissions
router.get(
  "/submissions",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(c.getMySubmissions)
);

export default router;