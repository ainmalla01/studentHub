
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export async function getSkillsReport(collegeId) {
  if (!collegeId) {
    throw new AppError(401, "College authentication is required.");
  }

const students = await prisma.student.findMany({
  select: {
    id: true,
  },
});

  const studentIds = students.map((student) => student.id);

  if (studentIds.length === 0) {
    return {
      totalSkills: 0,
      totalStudents: 0,
      totalSkillAssignments: 0,
      skills: [],
    };
  }

  // Get student skill assignments for this college
  const studentSkills = await prisma.studentSkill.findMany({
    where: {
      studentId: {
        in: studentIds,
      },
    },
    select: {
      studentId: true,
      skill: {
        select: {
          name: true,
          category: true,
        },
      },
    },
  });

  // Group student skills
  const skillMap = new Map();

  for (const studentSkill of studentSkills) {
    const skillName = studentSkill.skill.name;
    const category = studentSkill.skill.category;

    const key = `${skillName}-${category}`;

    if (!skillMap.has(key)) {
      skillMap.set(key, {
        skill: skillName,
        category,
        count: 0,
      });
    }

    skillMap.get(key).count += 1;
  }

  const skills = Array.from(skillMap.values()).sort(
    (a, b) => b.count - a.count
  );

  // Number of different skills represented
  const totalSkills = skills.length;

  // Number of students represented in the report
  const totalStudents = new Set(
    studentSkills.map((studentSkill) => studentSkill.studentId)
  ).size;

  // Total student-skill records
  const totalSkillAssignments = studentSkills.length;

  return {
    totalSkills,
    totalStudents,
    totalSkillAssignments,
    skills,
  };
}
