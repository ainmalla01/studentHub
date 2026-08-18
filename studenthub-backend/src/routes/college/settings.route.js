import { Router } from "express";

import {
  getSettings,
  updateSettings,
} from "../../controller/college/settings.controller.js";

import { protect } from "../../middleware/protected.middleware.js";

const router = Router();

router.get("/", protect, getSettings);

router.patch("/", protect, updateSettings);

export default router;