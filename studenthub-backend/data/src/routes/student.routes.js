import { Router } from "express";
import * as c from "src/controllers/student.controller.js";
import { attachActor, requireAuth, requireRole } from "src/middleware/auth.middleware.js";
import { asyncHandler as h } from "src/utils/asyncHandler.js";

const router = Router();
const college = requireRole("COLLEGE");

router.use(requireAuth);

// College-only. Static paths are declared before "/:id" to avoid collisions.
router.post("/", college, h(c.createStudent));
router.get("/", college, h(c.getStudents));
router.get("/count", college, h(c.getStudentCount));
router.get("/student-id/:studentId", college, h(c.getStudentByStudentId));
router.post("/:id/reset-credentials", college, h(c.resetStudentCredentials));
router.patch("/:id", college, h(c.updateStudent));
router.delete("/:id", college, h(c.deleteStudent));

// College, or the student themselves
router.get("/:id/stats", attachActor, h(c.getStudentStats));
router.get("/:id", attachActor, h(c.getStudent));

export default router;
