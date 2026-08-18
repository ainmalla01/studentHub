import * as studentsService from "../../services/college/students.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getStudents = asyncHandler(async (req, res) => {

  const result = await studentsService.getStudents(req.college.id);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { studentId } = req.params;

  const student = await studentsService.getStudentById(
    collegeId,
    studentId
  );

  res.status(200).json({
    success: true,
    data: student,
  });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { studentId } = req.params;

  const student = await studentsService.updateStudent(
    collegeId,
    studentId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: student,
  });
});