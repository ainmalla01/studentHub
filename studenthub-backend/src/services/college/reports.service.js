import {prisma} from "../../config/prisma.js";

export const getCollegeReport = async ({
  collegeId,
}) => {
  const [
    totalStudents,
    totalProjects,
    approvedProjects,
    pendingProjects,
    totalEvents,
    upcomingEvents,
    totalNotices,
    totalCommunities,
  ] = await Promise.all([
    prisma.student.count({
      where: { collegeId },
    }),

    prisma.project.count({
      where: { collegeId },
    }),

    prisma.project.count({
      where: {
        collegeId,
        status: "APPROVED",
      },
    }),

    prisma.project.count({
      where: {
        collegeId,
        status: "PENDING_CHECK",
      },
    }),

    prisma.event.count({
      where: { collegeId },
    }),

    prisma.event.count({
      where: {
        collegeId,
        startDateTime: {
          gte: new Date(),
        },
      },
    }),

    prisma.notice.count({
      where: { collegeId },
    }),

    prisma.community.count({
      where: { collegeId },
    }),
  ]);

  return {
    students: {
      total: totalStudents,
    },

    projects: {
      total: totalProjects,
      approved: approvedProjects,
      pending: pendingProjects,
    },

    events: {
      total: totalEvents,
      upcoming: upcomingEvents,
    },

    notices: {
      total: totalNotices,
    },

    communities: {
      total: totalCommunities,
    },
  };
};