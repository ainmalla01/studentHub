import * as service from "src/services/skill.service.js";
import { ok } from "src/utils/response.js";
import { createSkillsSchema, skillQuerySchema } from "src/validators/skill.validator.js";

export const getSkills = async (req, res) =>
  ok(res, await service.getAllSkills(skillQuerySchema.parse(req.query)));

export const createSkillsController = async (req, res) => {
  const { skills } = createSkillsSchema.parse(req.body);
  const result = await service.createSkills(skills);

  // Response keeps the original top-level shape ({ success, message, count, ... }).
  return res.status(201).json({
    success: true,
    message: result.count > 0 ? "Skills added successfully" : "No new skills were added",
    ...result,
  });
};
