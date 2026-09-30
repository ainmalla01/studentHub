import * as notificationService from "../services/notification.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/notifications
 *
 * Get notifications for the currently
 * authenticated user.
 */
export const getNotifications = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        401,
        "Authentication required."
      );
    }

    const result =
      await notificationService.getNotifications(
        userId
      );

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 *
 * Mark one notification as read.
 */
export const markAsRead = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      throw new AppError(
        401,
        "Authentication required."
      );
    }

    await notificationService.markAsRead(
      notificationId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 *
 * Mark all notifications of the authenticated
 * user as read.
 */
export const markAllAsRead = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(
        401,
        "Authentication required."
      );
    }

    const result =
      await notificationService.markAllAsRead(
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 *
 * Delete one notification belonging to
 * the authenticated user.
 */
export const deleteNotification = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      throw new AppError(
        401,
        "Authentication required."
      );
    }

    const result =
      await notificationService.deleteNotification(
        notificationId,
        userId
      );

    return res.status(200).json({
      success: true,
      message:
        "Notification deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};