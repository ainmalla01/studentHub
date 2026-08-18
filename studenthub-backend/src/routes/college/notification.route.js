import { Router } from "express";

import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
} from "../../controller/college/events.controller.js";

import { protect } from "../../middleware/protected.middleware.js";

const router = Router();

router.get("/", protect, getEvents);

router.get("/:eventId", protect, getEventById);

router.post("/", protect, createEvent);

router.patch("/:eventId", protect, updateEvent);

router.delete("/:eventId", protect, deleteEvent);

router.get(
  "/:eventId/participants",
  protect,
  getEventParticipants
);

export default router;