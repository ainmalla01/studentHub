// auth.validate
import { z } from "zod";

// export const registerSchema = z
//   .object({
//     fullName: z.string().min(3, "Full name must be at least 3 characters"),
//     email: z.string().email("Invalid email address"),
//     password: z.string().min(6, "Password must be at least 6 characters"),
//     confirmPassword: z
//       .string()
//       .min(6, "Confirm password must be at least 6 characters"),
//     role: z.enum(["STUDENT", "TEACHER"]),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

  export const studentRegisterSchema = z
  .object({
    firstName: z.string().min(3, "Full name must be at least 3 characters"),
    lastName: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    // phone: z.int64.min(6, "Password must be at least 6 characters"),
    role: z.enum(["STUDENT", "ADMIN"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
  
export const loginSchema=z.object({
   email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),

}) 
  console.log("validate is here")