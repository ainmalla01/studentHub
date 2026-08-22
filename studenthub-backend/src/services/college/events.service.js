import {prisma} from "../../config/prisma.js";
export const getEvents = async () => {
  return await prisma.event.findMany();
};
export const getEventById = async (id) => {
  return await prisma.event.findUnique({
    where: { id },
  });
};

export const createEvent = async (data) => {
  return await prisma.event.create({
    data,
  });
};

export const updateEvent = async ({ id, data }) => {
  return await prisma.event.update({
    where: { id },
    data,
  });
};

export const deleteEvent = async (id) => {
  return await prisma.event.delete({
    where: { id },
  });
};


export const getEventParticipants = async (
) => {
  
};