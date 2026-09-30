import { Router } from "express";
import * as c from "src/controllers/auth.controller.js";
import {
  requireActiveStudent,
  requireAuth,
  requireRole,
} from "src/middleware/auth.middleware.js";
import { authLimiter } from "src/middleware/rateLimit.middleware.js";
import { asyncHandler as h } from "src/utils/asyncHandler.js";

const router = Router();

// College registration & login
router.post("/college/register", authLimiter, h(c.registerCollege));
router.post("/college/login", authLimiter, h(c.loginCollege));

// Student login & first-login password change
router.post("/student/login", authLimiter, h(c.loginStudent));
router.post(
  "/student/resetpassword",
  requireAuth,
  requireRole("STUDENT"),
  requireActiveStudent({ allowPasswordChange: true }),
  h(c.resetPassword),
);
router.get(
  "/student/check-password",
  requireAuth,
  requireRole("STUDENT"),
  requireActiveStudent({ allowPasswordChange: true }),
  h(c.checkUser),
);

// Session
router.get("/me", requireAuth, h(c.me));
router.get("/college/status", h(c.getCollegeStatus));
router.post("/logout", h(c.logout));

export default router;
