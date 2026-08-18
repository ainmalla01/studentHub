import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/prisma.js";

export const getCollegeInfo = asyncHandler(async (req, res, next) => {
    console.log(req.user.id)
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

  const collegeId = user?.college?.id;

  if (!collegeId) {
    return res.status(400).json({
      success: false,
      message: "No college associated with this user.",
    });
  }

  req.college = { id: collegeId };
    console.log(req.college.id)
  next();
});