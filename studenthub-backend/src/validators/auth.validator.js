import { z } from "zod";


export const emailSchema=z.object({email: z.string().email("Invalid email address")})
// College Registration
export const collegeRegisterSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8).max(100),
  location: z.string().trim().max(200).optional(),
  logo: z.string().url().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
});

// College Login
export const collegeLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});


// Student Login
export const studentLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Reset Password
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password must not exceed 100 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Update College Profile
export const updateCollegeProfileSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

// Student Registration
export const studentRegistrationSchema = z.object({
  name: z.string().trim().min(2).max(160),

  email: z.string().email("Invalid email address"),

  phone: z.string().trim().max(30).optional().or(z.literal("")),

  department: z.enum(["BCA", "CSIT", "BIT"]),

  batch: z.coerce
    .number()
    .int()
    .min(2000)
    .max(2100),
});

// chage password schema
export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Old password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password must not exceed 100 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address"),
});

export const verifyForgotPasswordSchema = z.object({
  token: z
    .string()
    .min(1, "Reset token is required"),
});

export const resetForgotPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Reset token is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
 