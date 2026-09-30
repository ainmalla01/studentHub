import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";
import { sendStudentEmail } from "../utils/email.js";
import { generateTemporaryPassword } from "../utils/generateTemporaryPassword.js";
import { buildPagination, skipTake } from "../utils/pagination.js";
import { hashPassword } from "../utils/password.js";
import { generateStudentId } from "../utils/studentId.js";

const withEmail = ({ user, ...student }) => ({ ...student, email: user?.email });

const studentInclude = { user: { select: { email: true } } };

const isStudentIdCollision = (error) =>
  error?.code === "P2002" && String(error.meta?.target ?? "").includes("student_id");

const deliverCredentials = async ({ email, studentId, temporaryPassword }) => {
  try {
    const { delivered } = await sendStudentEmail({ email, studentId, temporaryPassword });
    return delivered;
  } catch (error) {
    logger.error({ err: error, studentId }, "Failed to send student credentials email");
    return false;
  }
};

/**
 * Only a COLLEGE may act on any student in its college; a STUDENT only on itself.
 */
const assertCanAccess = (actor, student) => {
  if (actor.role === "STUDENT" && actor.studentId !== student.id) {
    throw new AppError(403, "You do not have permission to view this student.");
  }
};

export const createStudent = async (input, collegeId) => {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new AppError(409, "An account with this email already exists.");

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  let student;
  for (let attempt = 0; attempt < 5 && !student; attempt++) {
    try {
      student = await prisma.student.create({
        data: {
          studentId: generateStudentId(input),
          name: input.name.trim(),
          batch: input.batch,
          department: input.department.trim(),
          status: input.status ?? "ACTIVE",
          mustChangePassword: true,
          college: { connect: { id: collegeId } },
          user: { create: { email, passwordHash, role: "STUDENT" } },
        },
        include: studentInclude,
      });
    } catch (error) {
      if (!isStudentIdCollision(error)) throw error;
    }
  }
  if (!student) throw new AppError(500, "Could not generate a unique student ID. Please retry.");

  const emailSent = await deliverCredentials({
    email,
    studentId: student.studentId,
    temporaryPassword,
  });

  return { ...withEmail(student), emailSent };
};

export const getStudents = async (params, collegeId) => {
  const { page, limit, search, department, status, batch } = params;

  const where = {
    collegeId,
    ...(status ? { status } : {}),
    ...(batch ? { batch } : {}),
    ...(department ? { department: { equals: department, mode: "insensitive" } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { studentId: { contains: search, mode: "insensitive" } },
            { user: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      include: studentInclude,
      orderBy: { createdAt: "desc" },
      ...skipTake({ page, limit }),
    }),
    prisma.student.count({ where }),
  ]);

  return { items: items.map(withEmail), pagination: buildPagination({ page, limit, total }) };
};

export const getTotalStudents = (collegeId) => prisma.student.count({ where: { collegeId } });

export const getStudentById = async (id, actor) => {
  const student = await prisma.student.findFirst({
    where: { id, collegeId: actor.collegeId },
    include: studentInclude,
  });
  if (!student) throw new AppError(404, "Student not found.");
  assertCanAccess(actor, student);
  return withEmail(student);
};

export const getStudentByStudentId = async (publicId, collegeId) => {
  const student = await prisma.student.findFirst({
    where: { studentId: publicId, collegeId },
    include: studentInclude,
  });
  if (!student) throw new AppError(404, "Student not found.");
  return withEmail(student);
};

export const updateStudent = async (id, collegeId, input) => {
  const existing = await prisma.student.findFirst({
    where: { id, collegeId },
    select: { id: true, user: { select: { id: true, email: true } } },
  });
  if (!existing) throw new AppError(404, "Student not found.");

  const data = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.batch !== undefined) data.batch = input.batch;
  if (input.department !== undefined) data.department = input.department.trim();
  if (input.status !== undefined) data.status = input.status;

  if (input.email !== undefined && input.email.toLowerCase() !== existing.user.email) {
    const taken = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true },
    });
    if (taken) throw new AppError(409, "An account with this email already exists.");
    data.user = { update: { email: input.email.toLowerCase() } };
  }

  const updated = await prisma.student.update({ where: { id }, data, include: studentInclude });
  return withEmail(updated);
};

export const deleteStudent = async (id, collegeId) => {
  const student = await prisma.student.findFirst({
    where: { id, collegeId },
    select: { userId: true },
  });
  if (!student) throw new AppError(404, "Student not found.");

  // Deleting the user cascades to the student, participations, submissions and skills.
  await prisma.user.delete({ where: { id: student.userId } });
};

/**
 * Issues a new temporary password (forgotten password / lost email) and emails it.
 */
export const resetStudentCredentials = async (id, collegeId) => {
  const student = await prisma.student.findFirst({
    where: { id, collegeId },
    include: studentInclude,
  });
  if (!student) throw new AppError(404, "Student not found.");

  const temporaryPassword = generateTemporaryPassword();

  await prisma.user.update({
    where: { id: student.userId },
    data: {
      passwordHash: await hashPassword(temporaryPassword),
      student: { update: { mustChangePassword: true } },
    },
  });

  const emailSent = await deliverCredentials({
    email: student.user.email,
    studentId: student.studentId,
    temporaryPassword,
  });

  return { emailSent };
};

/**
 * Aggregated performance figures for a single student.
 */
export const getStudentStats = async (id, actor) => {
  const student = await prisma.student.findFirst({
    where: { id, collegeId: actor.collegeId },
    select: { id: true },
  });
  if (!student) throw new AppError(404, "Student not found.");
  assertCanAccess(actor, student);

  const [participations, byStatus, scored, topSkills, recentSubmissions] = await Promise.all([
    prisma.challengeParticipate.count({ where: { studentId: id } }),
    prisma.submission.groupBy({ by: ["status"], where: { studentId: id }, _count: { _all: true } }),
    prisma.submission.aggregate({
      where: { studentId: id, score: { not: null } },
      _avg: { score: true },
    }),
    prisma.studentSkill.findMany({
      where: { studentId: id },
      include: { skill: true },
      orderBy: { score: "desc" },
      take: 10,
    }),
    prisma.submission.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { challenge: { select: { id: true, title: true } } },
    }),
  ]);

  const count = (status) => byStatus.find((g) => g.status === status)?._count._all ?? 0;

  return {
    participations,
    totalSubmissions: byStatus.reduce((sum, g) => sum + g._count._all, 0),
    submitted: count("SUBMITTED"),
    underReview: count("UNDER_REVIEW"),
    evaluated: count("EVALUATED"),
    averageScore: Number((scored._avg.score ?? 0).toFixed(2)),
    topSkills,
    recentSubmissions,
  };
};
