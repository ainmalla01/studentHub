import {prisma} from "../../config/prisma.js";

export const getProjects = async ({ collegeId, query }) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);

  const skip = (page - 1) * limit;

  const search = query.search?.trim();
  const faculty = query.faculty;
  const status = query.status;

  const where = {
    collegeId,

    ...(search && {
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(faculty && {
      faculty,
    }),

    ...(status && {
      status,
    }),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.project.count({
      where,
    }),
  ]);

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProjectById = async (
  collegeId,
  projectId
) => {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      collegeId,
    },
  });
};

export const reviewProject = async ({
  collegeId,
  projectId,
  data,
  reviewerId,
}) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      collegeId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return prisma.project.update({
    where: {
      id: projectId,
    },

    data: {
      status: data.status,
      feedback: data.feedback,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  });
};