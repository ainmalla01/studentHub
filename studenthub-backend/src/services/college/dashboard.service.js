import { prisma } from "../../config/prisma.js";

export const getCollegeDashboard = async (collegeId) => {
  const [
    totalStudents,
    totalProjects,
    upcomingEventsCount, // 👈 1. Number (Count)
    totalCommunities,
    publishedNoticesCount,
    recentProjects,
    upcomingEventsList,  // 👈 2. Array (List of events)
    recentNotices,
  ] = await Promise.all([
    // Counts
    prisma.student.count({
      where: { collegeId },
    }),

    prisma.project.count({
      where: { collegeId },
    }),

    prisma.event.count({
      where: {
        collegeId,
        startDateTime: { gte: new Date() },
      },
    }),

    prisma.community.count({
      where: { collegeId },
    }),

    prisma.notice.count({
      where: {
        collegeId,
        status: "PUBLISHED",
      },
    }),

    // Lists with select fields for performance
    prisma.project.findMany({
      where: { collegeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    }),

    prisma.event.findMany({
      where: {
        collegeId,
        startDateTime: { gte: new Date() },
      },
      orderBy: { startDateTime: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        mode: true,
        startDateTime: true,
        venue: true,
        currentParticipants: true,
        maxParticipants: true,
      },
    }),

    prisma.notice.findMany({
      where: {
        collegeId,
        status: "PUBLISHED",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    }),
  ]);

  // Combine projects and notices into recentActivities for frontend rendering
  const recentActivities = [
    ...recentProjects.map((p) => ({
      id: p.id,
      type: "PROJECT",
      title: p.title,
      description: "New project submitted",
      createdAt: p.createdAt,
    })),
    ...recentNotices.map((n) => ({
      id: n.id,
      type: "NOTICE",
      title: n.title,
      description: "New notice published",
      createdAt: n.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return {
    stats: {
      totalStudents,
      totalCommunities,
      upcomingEvents: upcomingEventsCount, // 👈 Number count
      pendingApprovals: totalProjects,
      totalProjects,
      publishedNotices: publishedNoticesCount,
    },

    recentActivities,                 // 👈 Merged array for frontend
    upcomingEvents: upcomingEventsList, // 👈 Event list array
  };
};