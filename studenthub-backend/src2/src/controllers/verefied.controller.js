import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/response.js";
import * as verifiedService from "../services/verefied.service.js";

// ============================================================
// STUDENT VERIFICATION CONTROLLER
// ============================================================

export const checkStudentVerified = asyncHandler(
  async (req, res) => {
    // req.user.studentId is the Student PK (from the JWT).
    const studentId = req.user?.studentId;

    const result = await verifiedService.checkStudentVerified(studentId);

    return ok(res, result, "Verification status fetched.");
  }
);

export default checkStudentVerified;
