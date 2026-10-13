
import { Router } from "express";
import { getSkillsReportController } from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/skills",
  requireAuth,
  getSkillsReportController
);

export default router;
