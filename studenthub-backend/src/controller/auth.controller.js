import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  setAuthCookie,
  clearAuthCookie,
} from "../utils/cookies.js";

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

export const register = asyncHandler(async (req, res) => {
  console.log("BODY RECEIVED IN CONTROLLER:", req.body);
  console.log("register controller")
  const user = await authService.register(req.body,req.cloudinaryUrl);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

export const studentRegister = asyncHandler(async (req, res) => {
  console.log("BODY RECEIVED IN CONTROLLER for studentRegister:", req.body);
  console.log("register controller for studentRegister")
  console.log(req.college.id)
  const user = await authService.studentRegister(req.body,req.cloudinaryUrl,req.college.id);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const login = asyncHandler(async (req, res) => {
  console.log("login controller",req.body);
  const { user, token, refreshToken } = await authService.login(req.body);

  // 1. Set httpOnly cookies for SSR / Secure Cookie Auth
  setAuthCookie(res, token, refreshToken);

  // 2. Return token AND user in JSON body for Client Components
  res.status(200).json({
    success: true,
    message: "Login successful",
    token, // 👈 Added token here so localStorage.setItem("token", data.token) works!
    user,  // 👈 Renamed data -> user to match frontend expects (or keep as user)
    data: user,
  });
});

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

/*
|--------------------------------------------------------------------------
| Refresh Token
|--------------------------------------------------------------------------
*/
export const refreshToken = asyncHandler(async (req, res) => {
  // Extract token from cookies OR authorization header
  const refreshTokenValue = req.cookies?.refreshToken || req.body?.refreshToken;

  const result = await authService.refreshToken(refreshTokenValue);

  setAuthCookie(res, result.accessToken, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    accessToken: result.accessToken,
  });
});


export const userType_exists = asyncHandler(async (req, res) => {
  console.log("got here controller site")
  try {
    const { role } = req.query;

    // Call your DB service function here
    const exists = await authService.userType_exists(role); 

    return res.status(200).json({
      success: true,
      exists,
    });
  } catch (error) {
    // 💥 THIS WILL PRINT THE EXACT DATABASE ERROR IN YOUR TERMINAL!
    console.error("🔥 CRASH INSIDE CONTROLLER/SERVICE:", error);
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});