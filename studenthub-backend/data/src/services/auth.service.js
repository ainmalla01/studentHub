import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";
import { comparePassword, compareAgainstDummy, hashPassword } from "../utils/password.js";

const collegeUser = (user, college) => ({
  id: college.id,
  role: user.role,
  name: college.name,
  email: user.email,
  location: college.location,
  logo: college.logo,
  phone: college.phone,
});

const studentUser = (user, student) => ({
  id: student.id,
  role: user.role,
  studentId: student.studentId,
  name: student.name,
  email: user.email,
  department: student.department,
  batch: student.batch,
  status: student.status,
  mustChangePassword: student.mustChangePassword,
});

const collegeToken = (user, college) =>
  signToken({ sub: user.id, collegeId: college.id, role: user.role });

const studentToken = (user, student) =>
  signToken({
    sub: user.id,
    studentId: student.id,
    collegeId: student.collegeId,
    role: user.role,
  });

export const registerCollege = async (input) => {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new AppError(409, "An account with this email already exists.");

  const passwordHash = await hashPassword(input.password);

  const college = await prisma.college.create({
    data: {
      name: input.name.trim(),
      location: input.location?.trim() || null,
      logo: input.logo?.trim() || null,
      phone: input.phone?.trim() || null,
      user: { create: { email, passwordHash, role: "COLLEGE" } },
    },
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  return {
    token: collegeToken(college.user, college),
    user: collegeUser(college.user, college),
  };
};

export const loginCollege = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { college: true },
  });

  if (!user || user.role !== "COLLEGE" || !user.college) {
    await compareAgainstDummy(password);
    throw new AppError(401, "Invalid email or password.");
  }

  if (!(await comparePassword(password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password.");
  }

  return {
    token: collegeToken(user, user.college),
    user: collegeUser(user, user.college),
  };
};

export const loginStudent = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { student: true },
  });

  if (!user || user.role !== "STUDENT" || !user.student) {
    await compareAgainstDummy(password);
    throw new AppError(401, "Invalid email or password.");
  }

  // Temporary passwords are hashed exactly like normal ones.
  if (!(await comparePassword(password, user.passwordHash))) {
    throw new AppError(401, "Invalid email or password.");
  }

  if (user.student.status !== "ACTIVE") {
    throw new AppError(403, "This student account is inactive.", undefined, "ACCOUNT_INACTIVE");
  }

  return {
    token: studentToken(user, user.student),
    user: studentUser(user, user.student),
  };
};

/**
 * Sets a new password for the logged-in student and clears `mustChangePassword`.
 */
export const resetPassword = async (userId, { newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) throw new AppError(404, "User not found.");

  if (await comparePassword(newPassword, user.passwordHash)) {
    throw new AppError(400, "New password must be different from the current password.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(newPassword),
      student: { update: { mustChangePassword: false } },
    },
  });

  return { message: "Password reset successfully." };
};

export const checkCollegeExists = async () => {
  const college = await prisma.college.findFirst({ select: { id: true } });
  return { hasCollege: college !== null };
};

export const checkUser = (userId, studentId) =>
  prisma.student.findFirst({
    where: { id: studentId, userId },
    select: { id: true, userId: true, mustChangePassword: true },
  });

export const getMe = async ({ id, role, collegeId, studentId }) => {
  const base = { userId: id, role, collegeId: collegeId ?? null, studentId: studentId ?? null };

  if (role === "COLLEGE") {
    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) throw new AppError(401, "Account no longer exists.");
    return { ...base, profile: college };
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: { select: { email: true } } },
  });
  if (!student) throw new AppError(401, "Account no longer exists.");
  const { user, ...rest } = student;
  return { ...base, profile: { ...rest, email: user.email } };
};
