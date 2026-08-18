import * as reportsService from "../../services/college/reports.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getCollegeReport = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const report = await reportsService.getCollegeReport({
    collegeId,
    query: req.query,
  });

  res.status(200).json({
    success: true,
    data: report,
  });
});