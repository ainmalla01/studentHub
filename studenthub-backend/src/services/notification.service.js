import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

/**
 * Get notifications for the currently authenticated user.
 */
export const getNotifications = async (userId) => {
  const userNotifications =await prisma.userNotification.findMany({
      where: {
        userId,
      },

      include: {
        notification: {
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
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const totalCount =
    await prisma.userNotification.count({
      where: {
        userId,
      },
    });

  const unreadCount =
    await prisma.userNotification.count({
      where: {
        userId,
        isRead: false,
      },
    });

  return {
    data: userNotifications,
    meta: {
      totalCount,
      unreadCount,
    },
  };
};

/**
 * Mark one notification as read.
 */
export const markAsRead = async (
  notificationId,
  userId
) => {
  const userNotification =
    await prisma.userNotification.findFirst({
      where: {
        notificationId,
        userId,
      },
    });

  if (!userNotification) {
    throw new AppError(
      404,
      "Notification not found."
    );
  }

  if (userNotification.isRead) {
    return userNotification;
  }

  return await prisma.userNotification.update({
    where: {
      id: userNotification.id,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Mark all notifications as read
 * for the currently authenticated user.
 */
export const markAllAsRead = async (userId) => {
  const result =
    await prisma.userNotification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

  return {
    updatedCount: result.count,
  };
};

/**
 * Delete one notification for the current user.
 */
export const deleteNotification = async (
  notificationId,
  userId
) => {
  const userNotification =
    await prisma.userNotification.findFirst({
      where: {
        notificationId,
        userId,
      },
    });

  if (!userNotification) {
    throw new AppError(
      404,
      "Notification not found."
    );
  }

  await prisma.userNotification.delete({
    where: {
      id: userNotification.id,
    },
  });

  return {
    id: notificationId,
  };
};