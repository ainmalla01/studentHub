import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";


// ============================================================
// SHARED
// GLOBAL ERROR HANDLING MIDDLEWARE
// ============================================================

export const errorMiddleware = (
  error,
  _req,
  res,
  _next
) => {


  // ----------------------------------------------------------
  // ZOD VALIDATION ERROR
  // Handles request validation errors
  // ----------------------------------------------------------

  if (error instanceof ZodError) {
    res
      .status(400)
      .json({
        success: false,
        message: "Validation failed",
        errors: error.flatten(),
      });

    return;
  }


  // ----------------------------------------------------------
  // PRISMA DATABASE ERRORS
  // Handles known Prisma database errors
  // ----------------------------------------------------------

  if (
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {


    // --------------------------------------------------------
    // P2002 → Unique Constraint Violation
    // --------------------------------------------------------

    if (error.code === "P2002") {
      res
        .status(409)
        .json({
          success: false,
          message:
            "A record with this unique value already exists.",
        });

      return;
    }


    // --------------------------------------------------------
    // P2025 → Record Not Found
    // --------------------------------------------------------

    if (error.code === "P2025") {
      res
        .status(404)
        .json({
          success: false,
          message:
            "Requested record was not found.",
        });

      return;
    }
  }


  // ----------------------------------------------------------
  // APPLICATION ERROR
  // Handles custom AppError instances
  // ----------------------------------------------------------

  if (error instanceof AppError) {
    res
      .status(error.statusCode)
      .json({
        success: false,
        message: error.message,
        ...(error.details
          ? { details: error.details }
          : {}),
      });

    return;
  }


  // ----------------------------------------------------------
  // UNKNOWN / UNHANDLED ERROR
  // ----------------------------------------------------------

  console.error(error);

  res
    .status(500)
    .json({
      success: false,
      message: "Internal server error",
    });
};