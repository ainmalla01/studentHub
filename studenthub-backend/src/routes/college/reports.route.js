import { Router } from "express";

import {
  getCollegeReport,
} from "../../controller/college/reports.controller.js";

import { protect } from "../../middleware/protected.middleware.js";

const router = Router();

router.get("/overview", protect, getCollegeReport);

export default router;