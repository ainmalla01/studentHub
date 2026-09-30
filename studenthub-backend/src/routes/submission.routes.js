import { Router } from "express";

import * as c from "../controllers/submission.controller.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = Router();

// ============================================================
// STUDENT SUBMISSION ROUTES
// ============================================================

// Get my submissions
router.get(
  "/my",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(c.getMySubmissions)
);

// Create a submission
router.post(
  "/challenge/:id",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(c.createSubmission)
);

// ============================================================
// COLLEGE SUBMISSION ROUTES
// ============================================================

// Get all submissions
router.get(
  "/",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.getSubmissions)
);

// Get submission statistics
router.get(
  "/statistics",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.getStatistics)
);

// Get submissions by student
router.get(
  "/student/:studentId",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.getStudentSubmissions)
);

// Get submissions by challenge
router.get(
  "/challenge/:challengeId",
  requireAuth,
  asyncHandler(c.getChallengeSubmissions)
);

// Mark submission as under review
router.patch(
  "/:id/review",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.markUnderReview)
);

// Evaluate submission
router.patch(
  "/:id/evaluate",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.evaluateSubmission)
);

// Get a single submission
router.get(
  "/:id",
  requireAuth,
  asyncHandler(c.getSubmission)
);
router.patch("/:id/verify", requireAuth, c.verifySubmission);

export default router;