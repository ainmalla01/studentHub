// routes/college/events.route.js
import { Router } from "express";
import * as eventsController from "../../controller/college/events.controller.js";
import { protect, authorize } from "../../middleware/protected.middleware.js";

const router = Router();

router.use(protect);

// 🟢 Maps to POST /api/college/events
router.get("/", eventsController.getEvents);
router.post("/", authorize("COLLEGE_ADMIN"), eventsController.createEvent);

// 🟢 Submissions
router.get("/submissions", eventsController.getSubmissions);
router.get("/:eventId/submissions", eventsController.getSubmissions);
router.patch(
  "/submissions/:submissionId/evaluate",
  authorize("COLLEGE_ADMIN"),
  eventsController.evaluateSubmission
);

// 🟢 Single Event routes
router.get("/:eventId", eventsController.getEventById);
router.put("/:eventId", authorize("COLLEGE_ADMIN"), eventsController.updateEvent);
router.delete("/:eventId", authorize("COLLEGE_ADMIN"), eventsController.deleteEvent);
router.get("/:eventId/participants", eventsController.getEventParticipants);

export default router;