import {prisma} from "../../config/prisma.js";

export const getSettings = async (collegeId) => {
  return prisma.college.findUnique({
    where: {
      id: collegeId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      website: true,
      description: true,
      logo: true,
    },
  });
};

export const updateSettings = async (
  collegeId,
  data
) => {
  return prisma.college.update({
    where: {
      id: collegeId,
    },

    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      website: data.website,
      description: data.description,
      logo: data.logo,
    },
  });
};