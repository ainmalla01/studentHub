// routes/college/events.route.js
import { Router } from "express";
import * as eventsController from "../../controller/college/events.controller.js";
import { protect, authorize } from "../../middleware/protected.middleware.js";

const router = Router();

router.use(protect);

// 🟢 Maps to POST /api/college/events
router.get("/",eventsController.getEvents);
// router.post("/", authorize("COLLEGE_ADMIN"), eventsController.createEvent);
router.post("/",eventsController.createEvent);

export default router;