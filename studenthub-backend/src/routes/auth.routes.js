import { Router } from "express";
import * as c from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";


const router = Router();

// College Registration & Authentication
router.post("/college/register", asyncHandler(c.registerCollege));
router.post("/college/login", asyncHandler(c.loginCollege));

// Student Authentication
router.post("/student/login", asyncHandler(c.loginStudent));
router.post("/student/newpassword", requireAuth, requireRole("STUDENT"), asyncHandler(c.resetPassowrd)); // Fixed typo resetPassowrd -> resetPassword

router.post("/forgot-password",asyncHandler(c.forgotPassword))

// Current Session
router.get("/me", requireAuth, asyncHandler(c.me));

// College Status
router.get("/college/status", asyncHandler(c.getCollegeStatus));



// checking ckeckpassword
router.get(
  "/student/check-password",
  requireAuth,
  requireRole("STUDENT"),
  asyncHandler(c.checkUser)
);

router.post(
  "/change-password",
  requireAuth,
  asyncHandler(c.changePassword)
);
// Logout
router.post("/logout", asyncHandler(c.logout));

export default router;