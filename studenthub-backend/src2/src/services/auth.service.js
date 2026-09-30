import bcrypt from "bcrypt";

import { prisma } from "../config/prisma.js";

import { AppError } from "../utils/AppError.js";

import {
  signToken,
  verifyToken,
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

export const loginStudent = async (
  email,
  password
) => {
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


  // ----------------------------------------------------------
  // Password Check
  // ----------------------------------------------------------

 

    // When mustChangePassword is false,
    // use standard bcrypt comparison

   const  passwordMatches =
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


  // ----------------------------------------------------------
  // Student JWT
  // ----------------------------------------------------------

  const token = signToken({
    sub: user.id,
    studentId: user.student.id,
    role: user.role,
  });

  console.log(user);

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


// ------------------------------------------------------------
// Check Student Password Status
// Student → First Login / Password Check
// ------------------------------------------------------------

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


// ============================================================
// SHARED / SYSTEM AUTH
// ============================================================


// ------------------------------------------------------------
// Check Whether College Exists
// Used by College Registration / Login Gate
// ------------------------------------------------------------

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
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user) {
    throw new AppError("Email not found.", 404);
  }

  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      resetToken: tokenHash,
      resetTokenExpiresAt: expiresAt,
    },
  });

  await sendPasswordResetEmail(
    user.email,
    user.name,
    token
  );

  return {
    message: "Password reset token sent to your email.",
  };
};

export const newpasswordCreated = async (
  token,
  newPassword
) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: tokenHash,
      resetTokenExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError(
      "Invalid or expired reset token.",
      400
    );
  }

  const passwordHash = await bcrypt.hash(
    newPassword,
    12
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  await sendPasswordChangedEmail(
    user.email,
    user.name
  );

  return {
    message: "Password changed successfully.",
  };
};
