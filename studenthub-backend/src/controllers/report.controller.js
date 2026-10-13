
import { asyncHandler } from "../utils/asyncHandler.js";
import { getSkillsReport } from "../services/report.service.js";

export const getSkillsReportController = asyncHandler(async (req, res) => {
    const collegeId = req.user?.collegeId;

    const report = await getSkillsReport(collegeId);

    return res.status(200).json(report);
  }
);
