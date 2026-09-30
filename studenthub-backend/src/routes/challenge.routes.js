
import { Router } from "express";

import * as studentC from "../controllers/studentChallenge.controller.js";
import * as collegeC from "../controllers/collegeChallenge.controller.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = Router();

// ============================================================
// STUDENT CHALLENGES
// ============================================================

// Student challenge list
router.get(
  "/student",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(studentC.getStudentChallenges)
);

// Student challenge details
router.get(
  "/student/Mychallenges",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(studentC.getParticipateChallengeList)
);

// Participate in challenge
router.post(
  "/student/:challengeId/participate",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(studentC.participateInChallenge)
);

// Check student's participation
router.get(
  "/student/:challengeId/participation",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(studentC.checkParticipation)
);


// College challenge list
router.get(
  "/college",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(collegeC.getCollegeChallenges)
);



// College challenge details
router.get(
  "/college/:challengeId",
  requireAuth,
  asyncHandler(collegeC.getCollegeChallenge)
);

// Create challenge - status: DRAFT
router.post(
  "/",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(collegeC.createChallenge)
);

// Update challenge
router.patch(
  "/:id",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(collegeC.updateChallenge)
);

// Publish challenge - status: PUBLISHED
router.post(
  "/:id/publish",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(collegeC.publishChallenge)
);

// Delete challenge
router.delete(
  "/:id",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(collegeC.deleteChallenge)
);

export default router;
