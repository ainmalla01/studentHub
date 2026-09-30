import { Router } from "express";
import * as controller from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/", // <-- Change from "/dashboard" to "/" because it's already mounted on /api/reports/dashboard
  (req, _res, next) => {
    console.log("[DASHBOARD ROUTE] Incoming GET request to /api/reports/dashboard");
    next();
  },
  requireAuth,
  requireRole("COLLEGE"),
  asyncHandler(controller.getCollegeDashboard),
);

export default router;