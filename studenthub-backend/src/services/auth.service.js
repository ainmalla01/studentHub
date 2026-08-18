// services/auth.service.js

import { prisma,UserRole} from "../config/prisma.js";
import {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
  createAuthPayload,
} from "../utils/jwt.js";
import {
  passwordHash,
  comparePassword,
} from "../utils/password.js";
import { existingUser } from "./UserValidate.service.js";
import AppError from "../utils/AppError.js";


/*
|--------------------------------------------------------------------------
| Register Student
|--------------------------------------------------------------------------
*/
export const register = async (data,imgUrl,userId) => {
  // const emailExists = await existingUser(data.email);
  console.log("register service")

  const hashedPassword = await passwordHash(data.password);

const user = await prisma.user.create({
  data: {
    email: data.email,
    password: hashedPassword,
    role: "ADMIN" ,// role: "ADMIN" UserRole[role],
    college: {
      create: {
        name:data.name,        // Mapped to 'name' in schema
        location: data.location,      // Required field in schema
        phone: data.phone,            // Required field in schema
        logo:imgUrl, // Optional Cloudinary URL if uploaded
      },
    },
  },
  include: {
    college: true, // Returns the nested college data in the response object
  },
});


  return {
    id: user.id,
    email: user.email,
    role: user.role,
    phone:user.phone,
    logo: user.logo,
  };
};


export const studentRegister = async (data,imgUrl,collegeId) => {
  // const emailExists = await existingUser(data.email);
  console.log("register service")

  const hashedPassword = await passwordHash(data.password);
  const batchYear= parseInt(data.batchYear,10)

const user = await prisma.user.create({
  data: {
    email: data.email,
    password: hashedPassword,
    role: "STUDENT" ,// role: "ADMIN" UserRole[role],
    student: {
      create: {
        firstName:data.firstName,        // Mapped to 'name' in schema
        lastName:data.lastName,        // Mapped to 'name' in schema
        phone: data.phone,            // Required field in schema
        avatar:imgUrl,// Optional Cloudinary URL if upload
        department:data.department,
        batchYear:batchYear,
        collegeId:collegeId
      },
    },
  },
  include: {
    student: true, // Returns the nested college data in the response object
  },
});
if(user){
  console.log("successfully register")
}

  return {
    id: user.id,
    email: user.email,
    firstName:user.firstName,
    lastName:user.lastName,
    batchYear:user.batchYear,
    phone:user.phone,
    profile: user.avatar,
  };
};





/*
|--------------------------------------------------------------------------
| Login (Student & College Admin)
|--------------------------------------------------------------------------
*/export const login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      college: true,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.role !== "ADMIN" && user.role !== "COLLEGE") {
    throw new AppError("Access denied. College portal only.", 403);
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const collegeId = user.college?.id ?? null;

  const tokenPayload = {
    id: user.id,
    role: user.role,
    collegeId,
  };

  const token = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Return strictly the requested fields
  return {
    user: {
      email: user.email,
      collegeName: user.college?.name || "",
      phone: user.college?.phone || "",
      logo: user.college?.logo || "",
    },
    token,
    refreshToken,
  };
};

/*
|--------------------------------------------------------------------------
| Refresh Token
|--------------------------------------------------------------------------
*/
export const refreshToken = async (refreshTokenValue) => {
  if (!refreshTokenValue) {
    throw new AppError("Refresh token is required", 401);
  }

  const decoded = verifyRefreshToken(refreshTokenValue);

  if (!decoded) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // Verify user still exists in DB
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      student: true,
      college: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Determine current collegeId directly from database
  const collegeId =
    user.role === "ADMIN"
      ? user.college?.id ?? null
      : user.student?.collegeId ?? null;

  const payload = {
    id: user.id,
    role: user.role,
    collegeId,
  };

  const accessToken = generateToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

/*
|--------------------------------------------------------------------------
| Get Current Logged-In User
|--------------------------------------------------------------------------
*/
export const getMe = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          skills: true,
          college: true,
        },
      },
      college: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    student: user.student,
    college: user.college,
    collegeId:
      user.role === "ADMIN"
        ? user.college?.id ?? null
        : user.student?.collegeId ?? null,
  };
};


export const userType_exists = async ({ role }) => {
   console.log("got here service site")
  // Use UserRole[role] or check directly against the UserRole object

  const user = await prisma.user.findFirst({
    where: {
      role: UserRole[role] || role, // Matches UserRole.COLLEGE dynamically
    },
  });

  return Boolean(user);
};