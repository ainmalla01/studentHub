import { Router } from "express";
import * as c from "src/controllers/report.controller.js";
import { requireAuth, requireRole } from "src/middleware/auth.middleware.js";
import { asyncHandler as h } from "src/utils/asyncHandler.js";

const router = Router();

router.use(requireAuth, requireRole("COLLEGE"));

router.get("/dashboard", h(c.dashboard));
router.get("/students/:studentId/performance", h(c.studentPerformance));
router.get("/skills", h(c.skills));
router.get("/submissions", h(c.submissions));

export default router;
