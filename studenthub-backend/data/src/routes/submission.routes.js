import { Router } from "express";
import * as c from "src/controllers/submission.controller.js";
import {
  attachActor,
  requireActiveStudent,
  requireAuth,
  requireRole,
} from "src/middleware/auth.middleware.js";
import { asyncHandler as h } from "src/utils/asyncHandler.js";

const router = Router();
const college = requireRole("COLLEGE");

router.use(requireAuth);

router.post("/", requireRole("STUDENT"), requireActiveStudent(), h(c.createSubmission));

router.get("/", college, h(c.getSubmissions));
router.get("/statistics", college, h(c.getStatistics));
router.get("/challenge/:challengeId", college, h(c.getChallengeSubmissions));
router.patch("/:id/review", college, h(c.markUnderReview));
router.patch("/:id/evaluate", college, h(c.evaluateSubmission));

// College, or the student who owns the submission(s)
router.get("/student/:studentId", attachActor, h(c.getStudentSubmissions));
router.get("/:id", attachActor, h(c.getSubmission));

export default router;
