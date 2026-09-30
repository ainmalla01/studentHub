import { Router } from "express";
import * as c from "src/controllers/studentChallenge.controller.js";
import {
  requireActiveStudent,
  requireAuth,
  requireRole,
} from "src/middleware/auth.middleware.js";
import { asyncHandler as h } from "src/utils/asyncHandler.js";

const router = Router();

router.use(requireAuth, requireRole("STUDENT"), requireActiveStudent());

router.get("/dashboard", h(c.getDashboard));
router.get("/challenges", h(c.getStudentChallenges));
router.get("/challenges/:id", h(c.getStudentChallenge));
router.post("/challenges/:challengeId/participate", h(c.participateInChallenge));
router.get("/challenges/:challengeId/participation", h(c.checkParticipation));
router.get("/submissions", h(c.getMySubmissions));

export default router;
