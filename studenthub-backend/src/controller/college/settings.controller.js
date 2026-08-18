import * as settingsService from "../../services/college/settings.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getSettings = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const settings = await settingsService.getSettings(collegeId);

  res.status(200).json({
    success: true,
    data: settings,
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const settings = await settingsService.updateSettings(
    collegeId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "College settings updated successfully",
    data: settings,
  });
});