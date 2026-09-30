import { z } from "zod";
import * as service from "src/services/report.service.js";
import { ok } from "src/utils/response.js";

const studentIdParam = z.object({ studentId: z.string().uuid() });

export const dashboard = async (req, res) =>
  ok(res, await service.getDashboardReport(req.user.collegeId));

export const studentPerformance = async (req, res) =>
  ok(
    res,
    await service.getStudentPerformance(
      studentIdParam.parse(req.params).studentId,
      req.user.collegeId,
    ),
  );

export const skills = async (req, res) => ok(res, await service.getSkillReport(req.user.collegeId));

export const submissions = async (req, res) =>
  ok(res, await service.getSubmissionReport(req.user.collegeId));
