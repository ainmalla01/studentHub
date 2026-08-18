import { Router } from "express";

import {
  getProjects,
  getProjectById,
  reviewProject,
} from "../../controller/college/projects.controller.js";

import { protect } from "../../middleware/protected.middleware.js";

const router = Router();

router.get("/", protect, getProjects);

router.get("/:projectId", protect, getProjectById);

router.patch("/:projectId/review", protect, reviewProject);

export default router;