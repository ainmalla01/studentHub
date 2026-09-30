import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/prisma.js";


// ============================================================
// SHARED
// COLLEGE CONTEXT MIDDLEWARE
// ============================================================


// ------------------------------------------------------------
// Get College Information
// Shared → Resolve College from Authenticated User
// ------------------------------------------------------------

export const getCollegeInfo = asyncHandler(
  async (req, res, next) => {

    console.log(req.user.id);


    // --------------------------------------------------------
    // Find College Associated With Authenticated User
    // --------------------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },

      select: {
        college: {
          select: {
            id: true,
          },
        },
      },
    });


    // --------------------------------------------------------
    // Extract College ID
    // --------------------------------------------------------

    const collegeId = user?.college?.id;


    // --------------------------------------------------------
    // Validate College Association
    // --------------------------------------------------------

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: "No college associated with this user.",
      });
    }


    // --------------------------------------------------------
    // Attach College Information to Request
    // --------------------------------------------------------

    req.college = {
      id: collegeId,
    };

    console.log(req.college.id);


    next();
  }
);