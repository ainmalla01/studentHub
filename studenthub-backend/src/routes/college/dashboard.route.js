import { Router } from "express";

import {
  getCollegeDashboard,
} from "../../controller/college/dashboard.controller.js";

import { protect } from "../../middleware/protected.middleware.js";

const router = Router();

router.get("/", protect, getCollegeDashboard);

export default router;