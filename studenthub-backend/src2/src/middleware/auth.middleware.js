import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";


// ============================================================
// SHARED
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================================


// ------------------------------------------------------------
// Require Authentication
// Shared → Verify JWT Token
// ------------------------------------------------------------

/**
 * Middleware to verify JWT token
 * from Authorization Bearer header.
 */

export const requireAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  let token = null;


  // ----------------------------------------------------------
  // Extract Bearer Token
  // ----------------------------------------------------------

  if (
    authHeader &&
    authHeader.startsWith("Bearer ")
  ) {
    token = authHeader.split(" ")[1];
  }


  // ----------------------------------------------------------
  // Check Token
  // ----------------------------------------------------------

  if (!token) {
    console.warn(
      "[AUTH MIDDLEWARE] Missing or malformed Authorization header."
    );

    return next(
      new AppError(
        401,
        "Authentication required."
      )
    );
  }


  // ----------------------------------------------------------
  // Verify JWT Token
  // ----------------------------------------------------------

  try {
    const payload = verifyToken(token);


    // Attach authenticated user information
    // to the request object
    req.user = {
      id: payload.sub,
      role: payload.role,
      collegeId: payload.collegeId,
      studentId: payload.studentId,
    };


    next();

  } catch (error) {

    console.error(
      "[AUTH MIDDLEWARE ERROR] Token verification failed:",
      error.message
    );

    return next(
      new AppError(
        401,
        "Invalid or expired token."
      )
    );
  }
};


// ------------------------------------------------------------
// Require Role
// Shared → Role-Based Authorization
// ------------------------------------------------------------

export const requireRole = (...roles) => {
  return (req, _res, next) => {

    // User must be authenticated first
    if (!req.user) {
      return next(
        new AppError(
          401,
          "Authentication required."
        )
      );
    }


    // Check whether user's role is allowed
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          "You do not have permission to perform this action."
        )
      );
    }


    next();
  };
};
