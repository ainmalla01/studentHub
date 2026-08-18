import { prisma } from "../config/prisma.js";
import { verifyToken, extractBearerToken } from "../utils/jwt.js";

/*
|--------------------------------------------------------------------------
| Protect Middleware (Authentication)
|--------------------------------------------------------------------------
| Ensures user is logged in via Bearer Header OR Cookie
*/
export const protect = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. Extract Token from Cookie OR Authorization Header
    |--------------------------------------------------------------------------
    */
    let token = req.cookies?.accessToken;

    // Fallback: Check 'Authorization: Bearer <token>' header if cookie isn't present
    if (!token && req.headers.authorization) {
      token = extractBearerToken(req.headers.authorization);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Verify JWT Token
    |--------------------------------------------------------------------------
    */
    const decoded = verifyToken(token);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Verify User Still Exists in Database
    |--------------------------------------------------------------------------
    */
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Attach Authenticated User & CollegeId to Request Object
    |--------------------------------------------------------------------------
    */
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Authorize Middleware (Role-Based Access Control)
|--------------------------------------------------------------------------
| Used in routes like: authorize("COLLEGE_ADMIN") or authorize("STUDENT")
*/
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this resource",
      });
    }
    next();
  };
};