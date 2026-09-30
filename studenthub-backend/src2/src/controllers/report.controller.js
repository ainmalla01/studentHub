import { z } from "zod";

import * as service from "../services/report.service.js";

import { ok } from "../utils/response.js";


// ============================================================
// COLLEGE PORTAL
// REPORTS CONTROLLER
// ============================================================


// ------------------------------------------------------------
// Dashboard Report
// ------------------------------------------------------------

export const dashboard = async (_req, res) =>
  ok(
    res,
    await service.getDashboardReport()
  );


// ------------------------------------------------------------
// Student Performance Report
// ------------------------------------------------------------

export const studentPerformance = async (req, res) =>
  ok(
    res,
    await service.getStudentPerformance(
      z
        .object({
          studentId: z.string().uuid(),
        })
        .parse(req.params)
        .studentId
    )
  );


// ------------------------------------------------------------
// Skills Report
// ------------------------------------------------------------

export const skills = async (_req, res) =>
  ok(
    res,
    await service.getSkillReport()
  );


// ------------------------------------------------------------
// Submissions Report
// ------------------------------------------------------------

export const submissions = async (_req, res) =>
  ok(
    res,
    await service.getSubmissionReport()
  );