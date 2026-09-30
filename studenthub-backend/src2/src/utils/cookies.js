const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  // Use 'lax' for local development cross-port requests, 'strict' for production
  sameSite: isProduction ? "strict" : "lax",
  maxAge: COOKIE_MAX_AGE,
  path: "/",
};

export const setAuthCookie = (
  res,
  accessToken,
  // refreshToken
) => {
  res.cookie(
    "accessToken",
    accessToken,
    cookieOptions
  );
};

export const clearAuthCookie = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
  });
};
