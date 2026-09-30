import { prisma } from "../config/prisma.js";

/**
 * Create a new notification for a specific user
 */
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  challengeId = null,
  submissionId = null,
}) => {
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
 * Fetch paginated notifications with optional filter for unread only
 */
export const getUserNotifications = async (
  userId,
  page = 1,
  limit = 10,
  unreadOnly = false
) => {
  const skip = (page - 1) * limit;

  // Build dynamic where clause matching schema indexes
  const where = {
    userId,
    ...(unreadOnly && { isRead: false }),
  };

  const [notifications, totalCount, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        challenge: {
          select: { id: true, title: true },
        },
        submission: {
          select: { id: true, status: true },
        },
      },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    meta: {
      totalCount,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil((unreadOnly ? unreadCount : totalCount) / limit),
    },
  };
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

/**
 * Mark all unread notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

/**
 * Delete a specific notification
 */
export const deleteNotification = async (notificationId, userId) => {
  return await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
};