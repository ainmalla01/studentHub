
// utils/cookies.js

/*
|--------------------------------------------------------------------------
| Cookie lifetime
|--------------------------------------------------------------------------
|
| 7 days
|
*/

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/*
|--------------------------------------------------------------------------
| Authentication cookie options
|--------------------------------------------------------------------------
*/

const cookieOptions = {
  httpOnly: true,

  secure:
    process.env.NODE_ENV === "production",

  sameSite: "strict",

  maxAge: COOKIE_MAX_AGE,

  path: "/",
};

/*
|--------------------------------------------------------------------------
| Set authentication cookies
|--------------------------------------------------------------------------
*/

export const setAuthCookie = (
  res,
  accessToken,
  refreshToken
) => {
  res.cookie(
    "accessToken",
    accessToken,
    cookieOptions
  );

  res.cookie(
    "refreshToken",
    refreshToken,
    cookieOptions
  );
};

/*
|--------------------------------------------------------------------------
| Clear authentication cookies
|--------------------------------------------------------------------------
*/

export const clearAuthCookie = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};

