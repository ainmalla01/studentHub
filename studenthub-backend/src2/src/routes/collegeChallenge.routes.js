import { Router } from "express";

import * as c from "../controllers/collegeChallenge.controller.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// College challenge list
router.get(
  "/challenges",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.getCollegeChallenges)
);

// Create challenge
router.post(
  "/challenges",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.createChallenge)
);

// Challenge details
router.get(
  "/challenges/:id",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.getCollegeChallenge)
);

// Update challenge
router.patch(
  "/challenges/:id",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.updateChallenge)
);

// Publish challenge
router.patch(
  "/challenges/:id/publish",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.publishChallenge)
);

// Close challenge
router.patch(
  "/challenges/:id/close",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.closeChallenge)
);

// Delete challenge
router.delete(
  "/challenges/:id",
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(c.deleteChallenge)
);

export default router;