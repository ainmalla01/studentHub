import * as service from "../services/dashboard.services.js";
import { ok } from "../utils/response.js";


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