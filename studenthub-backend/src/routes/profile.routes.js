import express from "express";

import {
  getProfile,
  getCollegeProfile,
  updateCollegeProfile,
  deleteCollegeProfile,
} from "../controllers/profile.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Student profile
router.get("/", requireAuth, getProfile);

// College profile
router.get("/college", requireAuth, getCollegeProfile);
router.patch("/college", requireAuth, updateCollegeProfile);
router.delete("/college", requireAuth, deleteCollegeProfile);

export default router;