import { Router } from "express";

import {
  getStudents,
  getStudentById,
  updateStudent,
} from "../../controller/college/students.controller.js";

import { protect } from "../../middleware/protected.middleware.js";
import { getCollegeInfo } from "../../middleware/college.middleware.js";

const router = Router();

router.get("/totalstudent",getTotalstudent);

router.get("/", protect,(req,res,next)=>{console.log(req.user.id); next()},getCollegeInfo,(req,res,next)=>{console.log(req.college.id); next()}, getStudents);

router.get("/:studentId", protect, getStudentById);

router.patch("/:studentId", protect, updateStudent);

export default router;