// src/services/skill.service.js

import { prisma } from "../config/prisma.js";


// ============================================================
// COLLEGE SIDE
// SKILL MANAGEMENT
// ============================================================


// ------------------------------------------------------------
// Get All Skills
// College → Skills → View Skills
// ------------------------------------------------------------

export const getAllSkills = async (filters = {}) => {
  try {
    const whereClause = {};

    if (filters.category) {
      whereClause.category = filters.category;
    }

    const skills = await prisma.skill.findMany({
      where: whereClause,

      orderBy: {
        createdAt: "desc",
      },
    });

    return skills;
  } catch (error) {
    throw new Error(
      `Failed to fetch skills: ${error.message}`
    );
  }
};


// ------------------------------------------------------------
// Create Skills
// College → Skills → Create Skills
// ------------------------------------------------------------

export const createSkills = async (skillsData) => {
  try {
    const result = await prisma.skill.createMany({
      data: skillsData,
      skipDuplicates: true,
    });

    return result;
  } catch (error) {
    throw new Error(
      `Failed to create skills: ${error.message}`
    );
  }
};


// ============================================================
// SERVICE OBJECT
// ============================================================

// Also exported as an object if other files use
// skillService.method()

export const skillService = {
  getAllSkills,
  createSkills,
};