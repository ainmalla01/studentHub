import {prisma} from "../../config/prisma.js";

export const getEvents = async ({ collegeId, query }) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);

  const skip = (page - 1) * limit;

  const search = query.search?.trim();
  const category = query.category;
  const status = query.status;

  const where = {
    collegeId,

    ...(search && {
      title: {
        contains: search,
        mode: "insensitive",
      },
    }),

    ...(category && {
      category,
    }),

    ...(status && {
      status,
    }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        startDateTime: "asc",
      },
    }),

    prisma.event.count({
      where,
    }),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getEventById = async (
  collegeId,
  eventId
) => {
  return prisma.event.findFirst({
    where: {
      id: eventId,
      collegeId,
    },
  });
};

export const createEvent = async ({
  collegeId,
  creatorId,
  data,
}) => {
  return prisma.event.create({
    data: {
      ...data,
      collegeId,
      createdBy: creatorId,
    },
  });
};

export const updateEvent = async ({
  collegeId,
  eventId,
  data,
}) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      collegeId,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return prisma.event.update({
    where: {
      id: eventId,
    },
    data,
  });
};

export const deleteEvent = async (
  collegeId,
  eventId
) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      collegeId,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return prisma.event.delete({
    where: {
      id: eventId,
    },
  });
};

export const getEventParticipants = async (
  collegeId,
  eventId
) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      collegeId,
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return prisma.eventRegistration.findMany({
    where: {
      eventId,
    },
    include: {
      student: true,
    },
  });
};