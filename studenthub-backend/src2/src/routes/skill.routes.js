// skill.routes.js
import express from "express";
import { createSkillsController, getSkills } from "../controllers/skill.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getSkills);

router.post("/bulk", requireAuth, requireRole("COLLEGE"), createSkillsController);

export default router;
