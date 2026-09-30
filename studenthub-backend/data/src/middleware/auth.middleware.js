import { prisma } from "src/config/prisma.js";
import { AppError } from "src/utils/AppError.js";
import { asyncHandler } from "src/utils/asyncHandler.js";
import { verifyToken } from "src/utils/jwt.js";

/**
 * Verifies the `Authorization: Bearer <jwt>` header and sets `req.user`.
 * Only the header is accepted (no cookies), so the API is not exposed to CSRF.
 */
export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required."));
  }

  const token = header.slice("Bearer ".length).trim();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(new AppError(401, "Invalid or expired token."));
  }

  const validCollege = payload.role === "COLLEGE" && payload.sub && payload.collegeId;
  const validStudent = payload.role === "STUDENT" && payload.sub && payload.studentId;
  if (!validCollege && !validStudent) {
    return next(new AppError(401, "Invalid token payload."));
  }

  req.user = {
    id: payload.sub,
    role: payload.role,
    collegeId: payload.collegeId,
    studentId: payload.studentId,
  };
  return next();
};

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(new AppError(401, "Authentication required."));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "You do not have permission to perform this action."));
    }
    return next();
  };

/**
 * Loads the student behind the token from the database on every request, so a
 * deactivated or deleted student loses access immediately (not at token expiry),
 * and blocks accounts that still have to replace their temporary password.
 */
const loadStudentContext = async (req, { allowPasswordChange }) => {
  const student = await prisma.student.findFirst({
    where: { id: req.user.studentId, userId: req.user.id },
    select: {
      id: true,
      collegeId: true,
      department: true,
      batch: true,
      status: true,
      mustChangePassword: true,
    },
  });

  if (!student) throw new AppError(401, "Account no longer exists.");

  if (student.status !== "ACTIVE") {
    throw new AppError(403, "This student account is inactive.", undefined, "ACCOUNT_INACTIVE");
  }

  if (student.mustChangePassword && !allowPasswordChange) {
    throw new AppError(
      403,
      "You must change your temporary password before continuing.",
      undefined,
      "PASSWORD_CHANGE_REQUIRED",
    );
  }

  req.student = student;
  return student;
};

/** For STUDENT-only routes. Use after `requireAuth` + `requireRole("STUDENT")`. */
export const requireActiveStudent = ({ allowPasswordChange = false } = {}) =>
  asyncHandler(async (req, _res, next) => {
    await loadStudentContext(req, { allowPasswordChange });
    next();
  });

/**
 * For routes shared by both roles. Sets `req.actor`:
 *   COLLEGE -> { role, collegeId }
 *   STUDENT -> { role, collegeId, studentId }   (collegeId comes from the database)
 */
export const attachActor = asyncHandler(async (req, _res, next) => {
  if (req.user.role === "COLLEGE") {
    req.actor = { role: "COLLEGE", collegeId: req.user.collegeId };
  } else {
    const student = await loadStudentContext(req, { allowPasswordChange: false });
    req.actor = { role: "STUDENT", collegeId: student.collegeId, studentId: student.id };
  }
  next();
});
