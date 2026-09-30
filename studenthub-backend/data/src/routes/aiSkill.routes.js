import { Router } from "express";
import { generateSkillsController } from "src/controllers/aiSkill.controller.js";
import { requireAuth, requireRole } from "src/middleware/auth.middleware.js";
import { aiLimiter } from "src/middleware/rateLimit.middleware.js";
import { asyncHandler as h } from "src/utils/asyncHandler.js";

const router = Router();

router.post("/generate", requireAuth, requireRole("COLLEGE"), aiLimiter, h(generateSkillsController));

export default router;
