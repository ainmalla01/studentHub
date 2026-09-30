import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

/**
 * Create a notification for a specific user.
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  challengeId = null,
  submissionId = null,
}) => {
  if (!userId) {
    throw new AppError(
      400,
      "Notification recipient is required."
    );
  }

  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      challengeId,
      submissionId,
    },
  });
};

/**
 * Get notifications for the currently authenticated user.
 */
export const getNotifications = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },

    include: {
      challenge: {
        select: {
          id: true,
          title: true,
        },
      },

      submission: {
        select: {
          id: true,
          status: true,
          challenge: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const totalCount = await prisma.notification.count({
    where: {
      userId,
    },
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return {
    data: notifications,

    meta: {
      totalCount,
      unreadCount,
    },
  };
};

/**
 * Mark one notification as read.
 *
 * The userId check ensures that a user
 * cannot mark another user's notification.
 */
export const markAsRead = async (
  notificationId,
  userId
) => {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

  if (!notification) {
    throw new AppError(
      404,
      "Notification not found."
    );
  }

  if (notification.isRead) {
    return notification;
  }

  return await prisma.notification.update({
    where: {
      id: notificationId,
    },

    data: {
      isRead: true,
    },
  });
};

/**
 * Mark all notifications as read
 * for the currently authenticated user.
 */
export const markAllAsRead = async (userId) => {
  const result =
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });

  return {
    updatedCount: result.count,
  };
};

/**
 * Delete one notification.
 *
 * The userId check ensures that a user
 * cannot delete another user's notification.
 */
export const deleteNotification = async (
  notificationId,
  userId
) => {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

  if (!notification) {
    throw new AppError(
      404,
      "Notification not found."
    );
  }

  await prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });

  return {
    id: notificationId,
  };
};