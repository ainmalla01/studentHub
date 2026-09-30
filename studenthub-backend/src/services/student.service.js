// src/services/student.service.js
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { sendWelcomeEmail } from "../utils/send.mail.js";

// ============================================================
// CREATE STUDENT
// College → Students → Create Student
// ============================================================


export const createStudent = async (
  collegeId,
  data,
  profile_url,
  password
) => {
  // ----------------------------------------------------------
  // 1. Validate college authentication
  // ----------------------------------------------------------

  if (!collegeId) {
    throw new AppError(
      401,
      "College authentication is required."
    );
  }

  // ----------------------------------------------------------
  // 2. Destructure validated data
  // ----------------------------------------------------------

  const {
    email,
    name,
    batch,
    phone,
    department,
  } = data;

  // ----------------------------------------------------------
  // 3. Validate temporary password
  // ----------------------------------------------------------

  if (!password) {
    throw new AppError(
      400,
      "Temporary password is required."
    );
  }

  console.log("[CREATE STUDENT] Email:", email);
  console.log("[CREATE STUDENT] Temporary password:", password);

  // ----------------------------------------------------------
  // 4. Check whether email already exists
  // ----------------------------------------------------------

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(
      409,
      "A user with this email already exists."
    );
  }

  // ----------------------------------------------------------
  // 5. Hash EXACT SAME password
  // ----------------------------------------------------------

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  // ----------------------------------------------------------
  // 6. Create student account
  // ----------------------------------------------------------

  const student = await prisma.$transaction(
    async (tx) => {

      // ------------------------------------------------------
      // Generate student ID
      // ------------------------------------------------------

      const studentCount =
        await tx.student.count({
          where: {
            department,
            batch,
          },
        });

      const studentId =
        `${department}-${batch}-${studentCount + 1}`;

      // ------------------------------------------------------
      // Get college
      // ------------------------------------------------------

      const college =
        await tx.college.findUnique({
          where: {
            id: collegeId,
          },
          select: {
            name: true,
          },
        });

      if (!college) {
        throw new AppError(
          404,
          "College not found."
        );
      }

      // ------------------------------------------------------
      // Create User
      // ------------------------------------------------------

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: "STUDENT",
        },
      });

      // ------------------------------------------------------
      // Create Student
      // ------------------------------------------------------

      const createdStudent =
        await tx.student.create({
          data: {
            userId: user.id,

            profile: profile_url || null,

            studentId,

            name,

            batch,

            department,

            phone: phone || null,

            university: college.name,

            mustChangePassword: true,

            isVerified: true,
          },

          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        });

      return createdStudent;
    }
  );

  // ----------------------------------------------------------
  // 7. Send EXACT SAME password that was hashed above
  // ----------------------------------------------------------

  try {
    await sendWelcomeEmail(
      student.user.email,
      student.name,
      password,
    );

    console.log(
      "[CREATE STUDENT] Login credentials email sent successfully."
    );
  } catch (emailError) {
    console.error(
      "[CREATE STUDENT] Failed to send student email:",
      emailError
    );

    // Important:
    // Student was already created.
    // Do not silently pretend email was sent.
    throw new AppError(
      500,
      "Student account was created, but the login email could not be sent."
    );
  }

  // ----------------------------------------------------------
  // 8. Return student
  // ----------------------------------------------------------

  return {
    id: student.id,
    userId: student.userId,
    studentId: student.studentId,
    name: student.name,
    email: student.user.email,
    batch: student.batch,
    department: student.department,
    phone: student.phone,
    university: student.university,
    profile: student.profile,
    mustChangePassword: student.mustChangePassword,
  };
};

// ============================================================
// GET STUDENTS
// College → Students
// ============================================================

export const getStudents = async ({
  page = 1,
  limit = 10,
  department,
  status,
}) => {
  // ----------------------------------------------------------
  // Pagination
  // ----------------------------------------------------------

  const skip =
    (page - 1) * limit;

  // ----------------------------------------------------------
  // Build filters
  // ----------------------------------------------------------

  const where = {};

  // Department filter
  if (department) {
    where.department = department;
  }

  // Status filter
  if (status) {
    where.status = status;
  }

  // ----------------------------------------------------------
  // Fetch students + total
  // ----------------------------------------------------------

  const [students, total] =
    await Promise.all([
      prisma.student.findMany({
        skip,
        take: limit,

        where,

        include: {
          user: {
            select: {
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.student.count({
        where,
      }),
    ]);

  // ----------------------------------------------------------
  // Return result
  // ----------------------------------------------------------

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


export const getTotalStudents = async () => {
  return await prisma.student.count();
};




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

  return {
    totalSkills: student.skills
      ? student.skills.length
      : 0,

    status: student.status || "ACTIVE",

    department:
      student.department || "N/A",
  };
};