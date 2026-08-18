
import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../config/prisma.js";

export const loadStudent = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: {
      userId: req.user.id,
    },
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  req.student = {
    id: student.id,
  };

  next();
});
