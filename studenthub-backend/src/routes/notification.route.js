import express from "express";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * All notification routes require authentication.
 *
 * These routes work for both:
 * - College users
 * - Student users
 */

/**
 * GET /api/notifications
 *
 * Get notifications for the currently
 * authenticated user.
 */
router.get(
  "/",
  requireAuth,
  getNotifications
);

/**
 * PATCH /api/notifications/read-all
 *
 * Mark all notifications belonging to
 * the currently authenticated user as read.
 */
router.patch(
  "/read-all",
  requireAuth,
  markAllAsRead
);

/**
 * PATCH /api/notifications/:id/read
 *
 * Mark one notification as read.
 */
router.patch(
  "/:id/read",
  requireAuth,
  markAsRead
);

/**
 * DELETE /api/notifications/:id
 *
 * Delete one notification belonging to
 * the currently authenticated user.
 */
router.delete(
  "/:id",
  requireAuth,
  deleteNotification
);

export default router;