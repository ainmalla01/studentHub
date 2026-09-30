import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/prisma.js";


// ============================================================
// SHARED
// STUDENT CONTEXT MIDDLEWARE
// ============================================================


// ------------------------------------------------------------
// Load Student
// Shared → Resolve Student from Authenticated User
// ------------------------------------------------------------

export const loadStudent = asyncHandler(
  async (req, res, next) => {

    // --------------------------------------------------------
    // Find Student Associated With Authenticated User
    // --------------------------------------------------------

    const student = await prisma.student.findUnique({
      where: {
        userId: req.user.id,
      },
    });


    // --------------------------------------------------------
    // Validate Student Profile
    // --------------------------------------------------------

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }


    // --------------------------------------------------------
    // Attach Student Information to Request
    // --------------------------------------------------------

    req.student = {
      id: student.id,
    };


    next();
  }
);