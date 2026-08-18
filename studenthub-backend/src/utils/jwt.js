import jwt from "jsonwebtoken";

/**
 * JWT Configuration from Environment Variables
 */
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/*
|--------------------------------------------------------------------------
| Access Token Methods
|--------------------------------------------------------------------------
*/

/**
 * Generate JWT Access Token
 */
export const generateToken = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("JWT payload must be an object");
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: "studenthub-api",
    audience: "studenthub-client",
  });
};

/**
 * Verify JWT Access Token
 */
export const verifyToken = (token) => {
  if (!token) {
    throw new Error("JWT token is required");
  }

  return jwt.verify(token, JWT_SECRET, {
    issuer: "studenthub-api",
    audience: "studenthub-client",
  });
};

/*
|--------------------------------------------------------------------------
| Refresh Token Methods (ADDED)
|--------------------------------------------------------------------------
*/

/**
 * Generate JWT Refresh Token
 */
export const generateRefreshToken = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("JWT payload must be an object");
  }

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: "studenthub-api",
    audience: "studenthub-client",
  });
};

/**
 * Verify JWT Refresh Token
 */
export const verifyRefreshToken = (token) => {
  if (!token) {
    throw new Error("Refresh token is required");
  }

  return jwt.verify(token, JWT_REFRESH_SECRET, {
    issuer: "studenthub-api",
    audience: "studenthub-client",
  });
};

/*
|--------------------------------------------------------------------------
| Helper Utility Methods
|--------------------------------------------------------------------------
*/

/**
 * Decode JWT without verifying signature
 */
export const decodeToken = (token) => {
  if (!token) return null;
  return jwt.decode(token);
};

/**
 * Extract Bearer token from Authorization header
 */
export const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
};

/**
 * Generate minimal auth payload
 */
export const createAuthPayload = (user) => {
  return {
    userId: user.id,
    role: user.role,
  };
};