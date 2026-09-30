import { Router } from "express";
import * as c from "src/controllers/skill.controller.js";
import { requireAuth, requireRole } from "src/middleware/auth.middleware.js";
import { asyncHandler as h } from "src/utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/", h(c.getSkills));
router.post("/bulk", requireRole("COLLEGE"), h(c.createSkillsController));

export default router;
