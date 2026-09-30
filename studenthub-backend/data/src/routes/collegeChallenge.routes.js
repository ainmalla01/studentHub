import { Router } from "express";
import * as c from "src/controllers/collegeChallenge.controller.js";
import { requireAuth, requireRole } from "src/middleware/auth.middleware.js";
import { asyncHandler as h } from "src/utils/asyncHandler.js";

const router = Router();

router.use("/challenges", requireAuth, requireRole("COLLEGE"));

router.get("/challenges", h(c.getCollegeChallenges));
router.post("/challenges", h(c.createChallenge));
router.get("/challenges/:id", h(c.getCollegeChallenge));
router.patch("/challenges/:id", h(c.updateChallenge));
router.patch("/challenges/:id/publish", h(c.publishChallenge));
router.patch("/challenges/:id/close", h(c.closeChallenge));
router.delete("/challenges/:id", h(c.deleteChallenge));

export default router;
