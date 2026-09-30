import {
  collegeLoginSchema,
  collegeRegisterSchema,
  studentLoginSchema,
  resetPasswordSchema,
  emailSchema
} from "../validators/auth.validator.js";

import * as service from "../services/auth.service.js";

import { ok } from "../utils/response.js";

import { AppError } from "../utils/AppError.js";



// ============================================================
// AUTH CONTROLLER
// SHARED AUTHENTICATION WORKFLOW
// ============================================================


// ============================================================
// COLLEGE
// ============================================================


// ------------------------------------------------------------
// College Register
// ------------------------------------------------------------

export const registerCollege = async (req, res) => {
  console.log(
    "[AUTH CONTROLLER] registerCollege called with body:",
    req.body
  );

  try {
    const data = collegeRegisterSchema.parse(req.body);

    console.log(
      "[AUTH CONTROLLER] registerCollege validation passed"
    );

    const result = await service.registerCollege(data);

    console.log(
      "[AUTH CONTROLLER] registerCollege service executed successfully"
    );

    // Token is returned in the response body for localStorage
    // storage on the frontend
    return ok(
      res,
      result,
      "College registered successfully.",
      201
    );

  } catch (error) {
    console.error(
      "[AUTH CONTROLLER ERROR] registerCollege failed:",
      error
    );

    throw error;
  }
};


// ------------------------------------------------------------
// College Login
// ------------------------------------------------------------

export const loginCollege = async (req, res) => {
  console.log(
    "[AUTH CONTROLLER] loginCollege called with email:",
    req.body?.email
  );

  try {
    const data = collegeLoginSchema.parse(req.body);

    console.log(
      "[AUTH CONTROLLER] loginCollege validation passed"
    );

    const result = await service.loginCollege(
      data.email,
      data.password
    );

    console.log(
      "[AUTH CONTROLLER] loginCollege service executed successfully for:",
      data.email
    );

    return ok(
      res,
      result,
      "College login successful."
    );

  } catch (error) {
    console.error(
      "[AUTH CONTROLLER ERROR] loginCollege failed:",
      error
    );

    throw error;
  }
};


// ============================================================
// STUDENT
// ============================================================


// ------------------------------------------------------------
// Student Login
// ------------------------------------------------------------

export const loginStudent = async (req, res) => {
  console.log(
    "[AUTH CONTROLLER] loginStudent called with email:",
    req.body?.email
  );

  try {
    const data = studentLoginSchema.parse(req.body);

    console.log(
      "[AUTH CONTROLLER] studentLogin validation passed"
    );

    const result = await service.loginStudent(
      data.email,
      data.password
    );

    console.log(
      "[AUTH CONTROLLER] loginStudent service executed successfully for:",
      data.email
    );

    return ok(
      res,
      result,
      "Student login successful."
    );

  } catch (error) {
    console.error(
      "[AUTH CONTROLLER ERROR] loginStudent failed:",
      error
    );

    throw error;
  }
};


// ------------------------------------------------------------
// Student Reset Password
// ------------------------------------------------------------

export const newPassword = async (req, res) =>
  ok(
    res,
    await service.newPassword(
      req.user.id,
      resetPasswordSchema.parse(req.body)
    ),
    "Password reset successfully."
  );


// ============================================================
// SHARED SESSION
// ============================================================


// ------------------------------------------------------------
// Current User (Me)
// ------------------------------------------------------------

export const me = async (req, res) => {
  console.log(
    "[AUTH CONTROLLER] me (current session) called for user:",
    req.user
  );

  return ok(
    res,
    {
      userId: req.user.id,
      role: req.user.role,
    },
    "Authenticated user fetched."
  );
};


// ------------------------------------------------------------
// College Status
// Check whether a college exists
// ------------------------------------------------------------

export const getCollegeStatus = async (req, res) => {
  console.log(
    "[AUTH CONTROLLER] getCollegeStatus called"
  );

  try {
    const result = await service.checkCollegeExists();

    console.log(
      "[AUTH CONTROLLER] getCollegeStatus result:",
      result
    );

    return ok(
      res,
      result,
      "College status fetched."
    );

  } catch (error) {
    console.error(
      "[AUTH CONTROLLER ERROR] getCollegeStatus failed:",
      error
    );

    throw error;
  }
};


// ------------------------------------------------------------
// Logout
// ------------------------------------------------------------

export const logout = async (req, res) => {
  console.log(
    "[AUTH CONTROLLER] logout called"
  );

  // With Bearer tokens in localStorage, logout is handled
  // client-side by clearing localStorage.

  return ok(
    res,
    null,
    "Logged out successfully."
  );
};


// ============================================================
// STUDENT
// CHECK USER / PASSWORD STATUS
// ============================================================

export const checkUser = async (req, res) => {
  const { id: userId, studentId } = req.user;

  const student = await service.checkUser(
    userId,
    studentId
  );

  if (!student) {
    throw new AppError(
      404,
      "Student not found"
    );
  }

  return ok(
    res,
    {
      userId: student.userId,
      studentId: student.id,
      mustChangePassword: student.mustChangePassword,
    },
    "Successful"
  );
};


// forgot password
export const forgotPassword = async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);

  ok(
    res,
    await service.forgotPassword(email),
    "Password reset email sent."
  );
};
export const resetPassword = async (req, res) => {
  const data = resetPasswordSchema.parse(req.body);

  ok(
    res,
    await service.resetPassword(
      data.token,
      data.newPassword
    ),
    "Password reset successfully."
  );
};