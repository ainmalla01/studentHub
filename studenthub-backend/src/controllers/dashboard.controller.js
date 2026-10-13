import * as service from "../services/dashboard.services.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// ============================================================
// COLLEGE PORTAL
// DASHBOARD CONTROLLER
// ============================================================


// ------------------------------------------------------------
// Get College Dashboard
// ------------------------------------------------------------

export const getCollegeDashboard = async (req, res) => {
  console.log(
    "[DASHBOARD CONTROLLER] getCollegeDashboard execution started."
  );

  try {
    const result = await service.getCollegeDashboard();

    console.log(
      "[DASHBOARD CONTROLLER] Dashboard data successfully retrieved."
    );

    return ok(
      res,
      result,
      "Dashboard data fetched successfully."
    );

  } catch (error) {
    console.error(
      "[DASHBOARD CONTROLLER ERROR]:",
      error
    );

    throw error;
  }
};


/**
 * GET /api/students/stats
 *
 * Get dashboard statistics for the authenticated student.
 */
export const getStudentDashboardStatsController =
  asyncHandler(async (req, res) => {
    const studentId = req.user?.studentId;

    const stats =
      await service.getStudentDashboardStats(studentId);

    return res.status(200).json({
      success: true,
      data: {
        stats,
      },
    });
  });

