import { generateSkills } from "src/services/aiSkill.service.js";
import { generateSkillsSchema } from "src/validators/skill.validator.js";

export const generateSkillsController = async (req, res) => {
  const skills = await generateSkills(generateSkillsSchema.parse(req.body));
  res.status(200).json({ success: true, skills });
};
