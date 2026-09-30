import { prisma } from "../config/prisma.js";

import { AppError } from "../utils/AppError.js";

import { uploadImage } from "../utils/cloudinaryUpload.js";


// ============================================================
// COLLEGE SIDE
// PROFILE / SETTINGS
// ============================================================


// ------------------------------------------------------------
// Get College Profile
// College → Settings → Profile
// ------------------------------------------------------------

export const getProfile = async (collegeId) => {
  const college = await prisma.college.findUnique({
    where: {
      id: collegeId,
    },

    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!college) {
    throw new AppError(
      404,
      "College not found."
    );
  }

  const {
    user,
    ...rest
  } = college;

  return {
    ...rest,
    email: user.email,
  };
};


// ------------------------------------------------------------
// Update College Profile
// College → Settings → Profile
// ------------------------------------------------------------

export const updateProfile = async (
  collegeId,
  input
) => {
  const data = {};

  if (input.name !== undefined) {
    data.name = input.name;
  }

  if (input.location !== undefined) {
    data.location = input.location || null;
  }

  if (input.phone !== undefined) {
    data.phone = input.phone || null;
  }

  return prisma.college.update({
    where: {
      id: collegeId,
    },

    data,
  });
};


// ------------------------------------------------------------
// Update College Logo
// College → Settings → Logo
// ------------------------------------------------------------

export const updateLogo = async (
  collegeId,
  file
) => {
  const result = await uploadImage(
    file,
    "studenthub/college/logo"
  );

  return prisma.college.update({
    where: {
      id: collegeId,
    },

    data: {
      logo: result.secure_url,
    },
  });
};