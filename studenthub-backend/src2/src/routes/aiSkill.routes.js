// aiSkill.routes.js
import express from "express";
import { generateSkillsController } from "../controllers/aiSkill.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", requireAuth, requireRole("COLLEGE"), generateSkillsController);

export default router;
