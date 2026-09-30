import { Router } from "express";
import * as c from "../controllers/college.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";
import { asyncHandler as h } from "../utils/asyncHandler.js";

const router = Router();

router.use("/profile", requireAuth, requireRole("COLLEGE"));
router.get("/profile", h(c.getProfile));
router.patch("/profile", h(c.updateProfile));

router.post(
  "/logo",
  requireAuth,
  requireRole("COLLEGE"),
  uploadSingleImage("logo"),
  h(c.uploadLogo),
);

export default router;
