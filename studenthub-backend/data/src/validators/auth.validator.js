import { z } from "zod";
import { httpUrl } from "./common.js";

const email = z.string().trim().toLowerCase().email("Invalid email address").max(254);

export const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must not exceed 100 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const collegeRegisterSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email,
  password: strongPassword,
  location: z.string().trim().max(200).optional(),
  logo: httpUrl.optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\-\s]{6,30}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
});

export const collegeLoginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(100),
});

export const studentLoginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(100),
});

export const resetPasswordSchema = z
  .object({
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateCollegeProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    location: z.string().trim().max(200),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\-\s]{6,30}$/, "Invalid phone number")
      .or(z.literal("")),
  })
  .partial();
