import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

// ============================================================
// STUDENT VERIFICATION
// ============================================================

export const checkStudentVerified = async (studentId) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      studentId: true,
      name: true,
      isVerified: true,
      status: true,
      user: {
        select: { email: true },
      },
    },
  });

  if (!student) {
    throw new AppError(404, "Student not found");
  }

  const { user, ...rest } = student;

  return {
    verified: student.isVerified,
    student: {
      ...rest,
      email: user?.email,
    },
  };
};
