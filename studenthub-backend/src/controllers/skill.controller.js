import {
  createSkills,
  skillService,
} from "../services/skill.service.js";

import { createSkillsSchema } from "../validators/skill.validator.js";


// ============================================================
// COLLEGE PORTAL
// SKILLS CONTROLLER
// ============================================================


// ------------------------------------------------------------
// Create Skills
// ------------------------------------------------------------

export const createSkillsController = async (
  req,
  res,
  next
) => {

  try {

    // Validate request body
    const data = createSkillsSchema.parse(
      req.body
    );


    // Create skills
    const result = await createSkills(
      data.skills
    );


    // Return response
    res.status(201).json({
      success: true,

      message:
        result.count > 0
          ? "Skills added successfully"
          : "No new skills were added",

      ...result,
    });

  } catch (error) {
    next(error);
  }
};


// ------------------------------------------------------------
// Get Skills
// ------------------------------------------------------------

export const getSkills = async (
  req,
  res,
  next
) => {

  try {

    // Call service to get skills
    // req.query can be used for filters
    const skills =
      await skillService.getAllSkills(
        req.query
      );

    console.log(skills);


    return res.status(200).json({
      success: true,
      data: skills,
    });

  } catch (error) {
    next(error);
  }
};