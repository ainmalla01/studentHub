import {prisma} from "../../config/prisma.js";

export const getNotices = async ({
  collegeId,
  query,
}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);

  const skip = (page - 1) * limit;

  const search = query.search?.trim();
  const category = query.category;
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
          content: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(category && {
      category,
    }),

    ...(status && {
      status,
    }),
  };

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.notice.count({
      where,
    }),
  ]);

  return {
    notices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getNoticeById = async (
  collegeId,
  noticeId
) => {
  return prisma.notice.findFirst({
    where: {
      id: noticeId,
      collegeId,
    },
  });
};

export const createNotice = async ({
  collegeId,
  authorId,
  data,
}) => {
  return prisma.notice.create({
    data: {
      ...data,
      collegeId,
      authorId,
    },
  });
};

export const updateNotice = async ({
  collegeId,
  noticeId,
  data,
}) => {
  const notice = await prisma.notice.findFirst({
    where: {
      id: noticeId,
      collegeId,
    },
  });

  if (!notice) {
    throw new Error("Notice not found");
  }

  return prisma.notice.update({
    where: {
      id: noticeId,
    },
    data,
  });
};

export const deleteNotice = async (
  collegeId,
  noticeId
) => {
  const notice = await prisma.notice.findFirst({
    where: {
      id: noticeId,
      collegeId,
    },
  });

  if (!notice) {
    throw new Error("Notice not found");
  }

  return prisma.notice.delete({
    where: {
      id: noticeId,
    },
  });
};