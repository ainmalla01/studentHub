// src/services/student.service.js

import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import { sendWelcomeEmail } from "../utils/send.mail.js";


// ============================================================
// COLLEGE SIDE
// STUDENT MANAGEMENT
// ============================================================


// ------------------------------------------------------------
// Create Student
// College → Students → Register Student
// ------------------------------------------------------------

export const createStudent = async (
  collegeId,
  data,
  profile_url,
  password
) => {

  // Destructure fields from the validated data payload
  const {
    email,
    name,
    batch,
    phone,
    department,
  } = data;


  // ----------------------------------------------------------
  // Send Welcome Email
  // ----------------------------------------------------------

  const send_mail = await sendWelcomeEmail(
    email,
    name,
    password
  );

  if (!send_mail) {
    return {
      message: "email not exits",
    };
  }


  // Hash the student password
  const passwordHash = await bcrypt.hash(
    password,
    12
  );


  // ----------------------------------------------------------
  // Database Transaction
  // ----------------------------------------------------------

  await prisma.$transaction(async (tx) => {

    // 1. Count existing students for ID generation
    //    starting at 1
    const studentCount = await tx.student.count({
      where: {
        department: department,
        batch: batch,
      },
    });

    const studentId =
      `${department}-${batch}-${studentCount + 1}`;


    // 2. Fetch college name and alias it as "university"
    const college = await tx.college.findFirst({
      where: {
        id: collegeId,
      },

      select: {
        name: true,
      },
    });

    const university = college
      ? college.name
      : "Unknown University";


    // 3. Create the User account record
    const user = await tx.user.create({
      data: {
        email,
        passwordHash: passwordHash,
        role: "STUDENT",
      },
    });


    // 4. Create the Student profile record
    //    linked through userId
    await tx.student.create({
      data: {
        userId: user.id,
        profile: profile_url,
        studentId: studentId,
        name: name,
        batch: batch,
        department: department,
        phone: phone,
        university: university,
      },
    });
  });


  // Return only the success message
  return {
    message: "student register successful",
  };
};


// ------------------------------------------------------------
// Get Students
// College → Students → Student List
// ------------------------------------------------------------

export const getStudents = async ({
  page = 1,
  limit = 10,
  department,
  status,
}) => {

  const skip = (page - 1) * limit;

  const where = {};


  // Filter by department
  if (department) {
    where.department = department;
  }


  // Filter by student status
  if (status) {
    where.status = status;
  }


  const [
    students,
    total,
  ] = await Promise.all([

    // Get paginated students
    prisma.student.findMany({
      skip,
      take: limit,
      where,
    }),

    // Get total student count
    prisma.student.count({
      where,
    }),
  ]);


  return {
    students,

    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit
      ),
    },
  };
};


// ------------------------------------------------------------
// Get Total Students
// College → Dashboard / Students → Total Count
// ------------------------------------------------------------

export const getTotalStudents = async () => {
  return await prisma.student.count();
};


// ------------------------------------------------------------
// Get Student By Database ID
// College → Students → Student Details
// ------------------------------------------------------------

export const getStudentById = async (id) => {

  const student = await prisma.student.findUnique({
    where: {
      id,
    },

    include: {
      skills: true,
      // Includes related skills if relation
      // is defined in Prisma schema
    },
  });


  if (!student) {
    throw new Error("Student not found");
  }


  return student;
};


// ------------------------------------------------------------
// Get Student By Student ID
// College → Students → Search Student
// ------------------------------------------------------------

export const getStudentByStudentId = async (
  studentId
) => {

  const student = await prisma.student.findUnique({
    where: {
      studentId,
    },

    include: {
      skills: true,
    },
  });


  if (!student) {
    throw new Error("Student not found");
  }


  return student;
};


// ------------------------------------------------------------
// Update Student
// College → Students → Edit Student
// ------------------------------------------------------------

export const updateStudent = async (
  id,
  data
) => {

  return await prisma.student.update({
    where: {
      id,
    },

    data,
  });
};


// ------------------------------------------------------------
// Delete Student
// College → Students → Delete Student
// ------------------------------------------------------------

export const deleteStudent = async (id) => {
  return await prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({
      where: { id },
      select: {
        userId: true,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    await tx.student.delete({
      where: {
        id,
      },
    });

    await tx.user.delete({
      where: {
        id: student.userId,
      },
    });

    return {
      message: "Student and user account deleted successfully.",
    };
  });
};


// ------------------------------------------------------------
// Get Student Stats
// College → Students → Student Performance / Stats
// ------------------------------------------------------------

export const getStudentStats = async (id) => {

  const student = await prisma.student.findUnique({
    where: {
      id,
    },

    include: {
      skills: true,
    },
  });


  if (!student) {
    throw new Error("Student not found");
  }


  // Calculate or aggregate summary statistics
  // for the student
  return {
    totalSkills: student.skills
      ? student.skills.length
      : 0,

    status: student.status || "ACTIVE",

    department:
      student.department || "N/A",
  };
};