import bcrypt from "bcrypt";

import { prisma } from "../config/prisma.js";

import { AppError } from "../utils/AppError.js";
import {generateTemporaryPassword} from '../utils/generateTemporaryPassword.js'
import {forgotPasswordReset} from '../utils/send.mail.js'

import {
  signToken
} from "../utils/jwt.js";


// ============================================================
// COLLEGE SIDE
// AUTHENTICATION
// ============================================================


// ------------------------------------------------------------
// College Register
// ------------------------------------------------------------

export const registerCollege = async (input) => {
  const email = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(
      409,
      "An account with this email already exists."
    );
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    12
  );

  const college = await prisma.college.create({
    data: {
      name: input.name.trim(),
      location: input.location?.trim() || null,
      logo: input.logo?.trim() || null,
      phone: input.phone?.trim() || null,

      user: {
        create: {
          email,
          passwordHash,
          role: "COLLEGE",
        },
      },
    },

    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  const token = signToken({
    sub: college.user.id,
    collegeId: college.id,
    role: college.user.role,
  });

  return {
    token,

    user: {
      id: college.id,
      role: college.user.role,
      name: college.name,
      email: college.user.email,
      location: college.location,
      logo: college.logo,
      phone: college.phone,
    },
  };
};


// ------------------------------------------------------------
// College Login
// ------------------------------------------------------------

export const loginCollege = async (
  email,
  password
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },

    include: {
      college: true,
    },
  });

  if (
    !user ||
    user.role !== "COLLEGE" ||
    !user.college
  ) {
    throw new AppError(
      401,
      "Invalid email or password."
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError(
      401,
      "Invalid email or password."
    );
  }

  const college = user.college;

  const token = signToken({
    sub: user.id,
    collegeId: college.id,
    role: user.role,
  });

  return {
    token,

    user: {
      id: college.id,
      role: user.role,
      name: college.name,
      email: user.email,
      location: college.location,
      logo: college.logo,
      phone: college.phone,
    },
  };
};


// ============================================================
// STUDENT SIDE
// AUTHENTICATION
// ============================================================


// ------------------------------------------------------------
// Student Login
// ------------------------------------------------------------
export const loginStudent = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    include: {
      student: true,
    },
  });


  if (
    !user ||
    user.role !== "STUDENT" ||
    !user.student
  ) {
    throw new AppError(
      401,
      "Invalid email or password."
    );
  }

  if (user.student.status !== "ACTIVE") {
    throw new AppError(
      403,
      "This student account is inactive."
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

 

  if (!passwordMatches) {
    throw new AppError(
      401,
      "Invalid email or password."
    );
  }

  const token = signToken({
    sub: user.id,
    studentId: user.student.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.student.id,
      role: user.role,
      studentId: user.student.studentId,
      name: user.student.name,
      email: user.email,
      department: user.student.department,
      batch: user.student.batch,
      status: user.student.status,
      mustChangePassword:
        user.student.mustChangePassword,
    },
  };
};

// ============================================================
// STUDENT SIDE
// PASSWORD MANAGEMENT
// ============================================================


// ------------------------------------------------------------
// Reset Student Password
// ------------------------------------------------------------

export const resetPassword = async (
  userId,
  pwd
) => {

  // Support both pwd.newPassword
  // and pwd.password just in case

  const newPassword =
    pwd?.newPassword || pwd?.password;

  if (!newPassword) {
    throw new AppError(
      400,
      "New password is required."
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      12
    );

  await prisma.user.update({
    where: {
      id: userId,
    },

    // Ensure this is the User table ID

    data: {
      passwordHash: hashedPassword,

      student: {
        update: {
          mustChangePassword: false,
        },
      },
    },
  });

  return {
    message: "Password reset successfully.",
  };
};




export const checkUser = async (
  userId,
  studentId
) => {
  const student =
    await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: userId,
      },

      select: {
        id: true,
        userId: true,
        mustChangePassword: true,
      },
    });

  return student;
};


export const checkCollegeExists =
  async () => {

    const college =
      await prisma.college.findFirst({
        select: {
          id: true,
        },
      });

    return {
      hasCollege: college !== null,
    };
  };

 export const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new AppError(404, "Email not found.");
  }

  // Generate temporary password
  const password = await generateTemporaryPassword();

  // Send temporary password first
  try {
    await forgotPasswordReset(user.email, password);
  } catch (error) {
    console.error("Forgot password email error:", error);

    throw new AppError(
      500,
      "Unable to send password reset email."
    );
  }

  // Hash the same temporary password
  const passwordHash = await bcrypt.hash(password, 12);

  // Update password only after email was sent successfully
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
    },
  });

  return {
    message: "A temporary password has been sent to your email.",
  };
};


export const changePassword = async (
  userId,
  oldPassword,
  newPassword
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      passwordHash: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError(
      404,
      "User account not found."
    );
  }

  // Verify current password
  const passwordMatches = await bcrypt.compare(
    oldPassword,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError(
      401,
      "Current password is incorrect."
    );
  }

  // Prevent using the same password
  const samePassword = await bcrypt.compare(
    newPassword,
    user.passwordHash
  );

  if (samePassword) {
    throw new AppError(
      400,
      "New password must be different from the current password."
    );
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    12
  );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,

      // If this is a student, normal password
      // change completes any pending first-login requirement.
      ...(user.role === "STUDENT"
        ? {
            student: {
              update: {
                mustChangePassword: false,
              },
            },
          }
        : {}),
    },
  });

  return {
    message: "Password changed successfully.",
  };
};