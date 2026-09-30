import {
  getStudentProfile,
  getCollegeProfile as getCollegeProfileService,
  updateCollegeProfile as updateCollegeProfileService,
  deleteCollegeProfile as deleteCollegeProfileService,
} from "../services/profile.service.js";

import { ok } from "../utils/response.js";

// ==========================================
// GET STUDENT PROFILE
// ==========================================

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await getStudentProfile(userId);

    return ok(
      res,
      profile,
      "Student profile fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET COLLEGE PROFILE
// ==========================================

export const getCollegeProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await getCollegeProfileService(userId);

    return ok(
      res,
      profile,
      "College profile fetched successfully"
    );
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE COLLEGE PROFILE
// ==========================================

export const updateCollegeProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await updateCollegeProfileService(
      userId,
      req.body
    );

    return ok(
      res,
      profile,
      "College profile updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE COLLEGE PROFILE
// ==========================================

export const deleteCollegeProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await deleteCollegeProfileService(userId);

    return ok(
      res,
      result,
      "College profile deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};