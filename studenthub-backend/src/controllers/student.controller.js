import { z } from "zod";

import * as service from "../services/student.service.js";

import { prisma } from "../config/prisma.js";

import { ok } from "../utils/response.js";

import {
  createStudentSchema,
  updateStudentSchema,
  updateProfileSchema,
  studentIdSchema,
} from "../validators/student.validator.js";

import { paginationQuery } from "../validators/common.js";

import { studentDefult_image } from "../utils/cloudinary.js";

import { generateTemporaryPassword } from "../utils/generateTemporaryPassword.js";


// ============================================================
// STUDENT CONTROLLER
// ============================================================


// ============================================================
// COLLEGE PORTAL
// STUDENTS
// ============================================================


// ------------------------------------------------------------
// Register / Create Student
// ------------------------------------------------------------
export const createStudent = async (req, res) => {
  const profile_url = await studentDefult_image();

  const password = await generateTemporaryPassword();

  console.log("Generated temporary password:", password);
  console.log("Student email:", req.body.email);

  const collegeId = req.user?.collegeId;

  const validatedData =
    createStudentSchema.parse(req.body);

  const result = await service.createStudent(
    collegeId,
    validatedData,
    profile_url,
    password
  );

  return ok(
    res,
    result,
    "Student created.",
    201
  );
};


// ------------------------------------------------------------
// Get Students
// Supports Pagination, Department and Status
// ------------------------------------------------------------

export const getStudents = async (req, res) =>
  ok(
    res,
    await service.getStudents({
      ...paginationQuery.parse(req.query),

      department:
        typeof req.query.department === "string"
          ? req.query.department
          : undefined,

      status:
        req.query.status === "ACTIVE" ||
        req.query.status === "INACTIVE"
          ? req.query.status
          : undefined,
    })
  );


// ------------------------------------------------------------
// Get Total Student Count
// ------------------------------------------------------------

export const getStudentCount = async (_req, res) =>
  ok(
    res,
    {
      total:
        await service.getTotalStudents(),
    }
  );


// ------------------------------------------------------------
// Get Student Details
// ------------------------------------------------------------

export const getStudent = async (req, res) =>
  ok(
    res,
    await service.getStudentById(
      z
        .object({
          id: z.string().uuid(),
        })
        .parse(req.params)
        .id
    )
  );


// ------------------------------------------------------------
// Get Student by Student ID
// ------------------------------------------------------------

export const getStudentByStudentId = async (
  req,
  res
) =>
  ok(
    res,
    await service.getStudentByStudentId(
      studentIdSchema
        .parse(req.params)
        .studentId
    )
  );


// ------------------------------------------------------------
// Update Student
// ------------------------------------------------------------

export const updateStudent = async (req, res) =>
  ok(
    res,
    await service.updateStudent(
      z
        .object({
          id: z.string().uuid(),
        })
        .parse(req.params)
        .id,

      updateStudentSchema.parse(
        req.body
      )
    ),
    "Student updated."
  );


// ------------------------------------------------------------
// Delete Student
// ------------------------------------------------------------

export const deleteStudent = async (req, res) => {

  await service.deleteStudent(
    z
      .object({
        id: z.string().uuid(),
      })
      .parse(req.params)
      .id
  );

  res.status(204).send();
};


// ------------------------------------------------------------
// Get Student Statistics
// ------------------------------------------------------------

export const getStudentStats = async (
  req,
  res
) => {

  // Use params.id if available;
  // fallback to logged-in student context.
  // NOTE: req.user.id is the User UUID, req.user.studentId
  // is the Student PK — stats are keyed by Student PK.
  const targetId =
    req.params?.id ||
    req.user?.studentId ||
    req.user?.id;

  const validatedId =
    z.string().uuid().parse(targetId);

  return ok(
    res,
    await service.getStudentStats(
      validatedId
    )
  );
};


// ============================================================
// STUDENT PORTAL
// PROFILE
// ============================================================


// ------------------------------------------------------------
// Get Student Profile
// ------------------------------------------------------------

export const getProfile = async (req, res) => {

  const userId =
    req.user?.id;
  // This is payload.sub (User ID)

  const studentCode =
    req.user?.studentId;
  // This is the student ID code from token

  if (!userId) {
    return res.status(400).json({
      success: false,
      message:
        "Unauthorized or missing user ID",
    });
  }


  // ----------------------------------------------------------
  // Find Student Profile
  // ----------------------------------------------------------

  // Look up student by matching User ID,
  // foreign key userId, or studentId code
  const student =
    await prisma.student.findFirst({
      where: {
        OR: [
          // In case student table PK is the user ID
          { id: userId },

          // In case student table has a foreign key userId
          { userId: userId },

          // In case studentId string matches
          { studentId: studentCode },
        ],
      },
    });
    const upadteprofile= await prisma.evalution.findMany({where:{studentId:studentCode},include:{challenge:true,skill:true}})



  // ----------------------------------------------------------
  // Student Not Found
  // ----------------------------------------------------------

  if (!student) {
    return res.status(404).json({
      success: false,
      message:
        "Student profile not found",
    });
  }


  return ok(
    res,
    {student,upadteprofile}
  );
};


// ------------------------------------------------------------
// Update Student Profile
// ------------------------------------------------------------

export const updateProfile = async (
  req,
  res
) => {

  const targetId =
    req.user?.studentId ||
    req.user?.id;

  const validatedId =
    z.string().uuid().parse(
      targetId
    );

  const validatedBody =
    updateProfileSchema.parse(
      req.body
    );


  // ----------------------------------------------------------
  // Update Profile
  // ----------------------------------------------------------

  const updatedStudent =
    await prisma.student.update({
      where: {
        id: validatedId,
      },

      data: validatedBody,
    });


  return ok(
    res,
    updatedStudent,
    "Profile updated successfully."
  );
};