import { generateSkills } from "../services/aiSkill.service.js";

export const generateSkillsController = async (req, res, next) => {
  try {
    const { program, focus, count } = req.body;

    const skills = await generateSkills({
      program,
      focus,
      count,
    });

    res.status(200).json({
      success: true,
      skills,
    });
  } catch (error) {
    next(error);
  }
};