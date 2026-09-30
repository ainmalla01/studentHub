import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticateUser);
// Get user notifications route
router.get("/", (req, res) => {
  res.json({ success: true, notifications: [] });
});
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;