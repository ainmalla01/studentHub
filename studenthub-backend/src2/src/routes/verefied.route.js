import { Router } from "express";
import { checkStudentVerified } from "../controllers/verefied.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Student ID is resolved from the JWT (req.user.studentId).
router.get(
  "/student/verified",
  requireAuth,
  requireRole("STUDENT"),
  checkStudentVerified
);

export default router;
