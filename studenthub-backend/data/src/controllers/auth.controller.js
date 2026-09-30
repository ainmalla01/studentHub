import {
  collegeLoginSchema,
  collegeRegisterSchema,
  resetPasswordSchema,
  studentLoginSchema,
} from "src/validators/auth.validator.js";
import * as service from "src/services/auth.service.js";
import { AppError } from "src/utils/AppError.js";
import { ok } from "src/utils/response.js";

export const registerCollege = async (req, res) => {
  const data = collegeRegisterSchema.parse(req.body);
  return ok(res, await service.registerCollege(data), "College registered successfully.", 201);
};

export const loginCollege = async (req, res) => {
  const { email, password } = collegeLoginSchema.parse(req.body);
  return ok(res, await service.loginCollege(email, password), "College login successful.");
};

export const loginStudent = async (req, res) => {
  const { email, password } = studentLoginSchema.parse(req.body);
  return ok(res, await service.loginStudent(email, password), "Student login successful.");
};

export const resetPassword = async (req, res) => {
  const data = resetPasswordSchema.parse(req.body);
  return ok(res, await service.resetPassword(req.user.id, data), "Password reset successfully.");
};

export const me = async (req, res) =>
  ok(res, await service.getMe(req.user), "Authenticated user fetched.");

export const getCollegeStatus = async (_req, res) =>
  ok(res, await service.checkCollegeExists(), "College status fetched.");

// Tokens are stateless and kept by the client, so logout is a client-side action.
export const logout = async (_req, res) => ok(res, null, "Logged out successfully.");

export const checkUser = async (req, res) => {
  const student = await service.checkUser(req.user.id, req.user.studentId);
  if (!student) throw new AppError(404, "Student not found.");

  return ok(
    res,
    {
      userId: student.userId,
      studentId: student.id,
      mustChangePassword: student.mustChangePassword,
    },
    "Successful",
  );
};
