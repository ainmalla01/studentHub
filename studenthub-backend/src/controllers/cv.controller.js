import { getStudentCV } from "../services/cv.service.js";
import { ok } from "../utils/response.js";

export const getCV = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cv = await getStudentCV(userId);

    return ok(res, cv, "Student CV data fetched successfully");
  } catch (error) {
    next(error);
  }
};