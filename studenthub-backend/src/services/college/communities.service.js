import {prisma} from "../../config/prisma.js";

export const getCommunities = async ({
  collegeId,
  query,
}) => {
  const search = query.search?.trim();
  const category = query.category;
  const status = query.status;

  return prisma.community.findMany({
    where: {
      collegeId,

      ...(search && {
        name: {
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
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getCommunityById = async (
  collegeId,
  communityId
) => {
  return prisma.community.findFirst({
    where: {
      id: communityId,
      collegeId,
    },
  });
};

export const createCommunity = async ({
  collegeId,
  creatorId,
  data,
}) => {
  return prisma.community.create({
    data: {
      ...data,
      collegeId,
      createdBy: creatorId,
    },
  });
};

export const updateCommunity = async ({
  collegeId,
  communityId,
  data,
}) => {
  const community = await prisma.community.findFirst({
    where: {
      id: communityId,
      collegeId,
    },
  });

  if (!community) {
    throw new Error("Community not found");
  }

  return prisma.community.update({
    where: {
      id: communityId,
    },
    data,
  });
};

export const deleteCommunity = async (
  collegeId,
  communityId
) => {
  const community = await prisma.community.findFirst({
    where: {
      id: communityId,
      collegeId,
    },
  });

  if (!community) {
    throw new Error("Community not found");
  }

  return prisma.community.delete({
    where: {
      id: communityId,
    },
  });
};

export const getCommunityMembers = async (
  collegeId,
  communityId
) => {
  const community = await prisma.community.findFirst({
    where: {
      id: communityId,
      collegeId,
    },
  });

  if (!community) {
    throw new Error("Community not found");
  }

  return prisma.communityMember.findMany({
    where: {
      communityId,
    },
    include: {
      student: true,
    },
  });
};