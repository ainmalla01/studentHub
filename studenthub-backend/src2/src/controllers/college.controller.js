import * as service from "../services/college.service.js";

import {
  updateCollegeProfileSchema,
} from "../validators/auth.validator.js";

import { AppError } from "../utils/AppError.js";
import { ok } from "../utils/response.js";


// ============================================================
// COLLEGE PORTAL
// PROFILE / SETTINGS CONTROLLER
// ============================================================


// ------------------------------------------------------------
// Profile
// ------------------------------------------------------------


// Get College Profile
export const getProfile = async (req, res) =>
  ok(
    res,
    await service.getProfile(req.user.collegeId),
    "College profile fetched."
  );


// Update College Profile
export const updateProfile = async (req, res) =>
  ok(
    res,
    await service.updateProfile(
      req.user.collegeId,
      updateCollegeProfileSchema.parse(req.body)
    ),
    "College profile updated."
  );


// ------------------------------------------------------------
// Logo
// ------------------------------------------------------------


// Upload / Update College Logo
export const uploadLogo = async (req, res) => {

  if (!req.file) {
    throw new AppError(
      400,
      "No image file provided (field name: logo)."
    );
  }

  return ok(
    res,
    await service.updateLogo(
      req.user.collegeId,
      req.file
    ),
    "Logo updated."
  );
};