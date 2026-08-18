import {prisma} from "../../config/prisma.js";

export const getStudents = async (collegeId) => {
  const students = await prisma.student.findMany({
    where: {
      collegeId:collegeId,
    },
    orderBy: {
      createdAt: "desc", // optional: keeps the list predictably sorted
    },
  });

  return students;
};


export const getStudentById = async (collegeId, studentId) => {
  return prisma.student.findFirst({
    where: {
      id: studentId,
      collegeId,
    },

    include: {
      skills: true,
    },
  });
};

export const updateStudent = async (
  collegeId,
  studentId,
  data
) => {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      collegeId,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  return prisma.student.update({
    where: {
      id: studentId,
    },
    data,
  });
};