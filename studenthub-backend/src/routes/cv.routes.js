import express from "express";
import { getCV } from "../controllers/cv.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getCV);

export default router;