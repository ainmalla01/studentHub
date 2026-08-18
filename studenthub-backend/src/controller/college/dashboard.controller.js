import * as dashboardService from "../../services/college/dashboard.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getCollegeDashboard = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const dashboard = await dashboardService.getCollegeDashboard(collegeId);

  res.status(200).json({
    success: true,
    data: dashboard,
  });
});