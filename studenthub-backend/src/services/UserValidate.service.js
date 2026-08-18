import { prisma } from "../config/prisma.js";
import AppError from "../utils/AppError.js";

/*
|--------------------------------------------------------------------------
| Existing User Check
|--------------------------------------------------------------------------
| Checks if a user already exists with the given email address.
*/
export const existingUser = async (email) => {
  if (!email) return false;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return !!user;
};

/*
|--------------------------------------------------------------------------
| Register Input Validation
|--------------------------------------------------------------------------
| Validates input data for student registration against requirements.
*/
export const validateRegisterInput = (data) => {
  const { fullName, email, password, specialization, faculty, semester } = data;

  if (!fullName || !email || !password || !specialization || !faculty || semester === undefined) {
    throw new AppError("All required fields must be provided.", 400);
  }

  // Validate Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Please provide a valid email address.", 400);
  }

  // Validate Password length
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long.", 400);
  }

  // Validate Semester is a positive integer
  if (typeof semester !== "number" || semester < 1) {
    throw new AppError("Semester must be a valid number starting from 1.", 400);
  }
};

/*
|--------------------------------------------------------------------------
| College Verification Helper
|--------------------------------------------------------------------------
| Checks if the provided collegeId exists in the database.
*/
export const validateCollegeExists = async (collegeId) => {
  if (!collegeId) return true; // Optional during initial registration

  const college = await prisma.college.findUnique({
    where: { id: collegeId },
    select: { id: true },
  });

  if (!college) {
    throw new AppError("The specified college does not exist.", 404);
  }

  return true;
};