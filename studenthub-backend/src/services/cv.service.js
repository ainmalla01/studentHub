
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
export const getStudentCV = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },

    select: {
      id: true,
      studentId: true,
      name: true,
      profile: true,
      headline: true,
      about: true,
      phone: true,
      location: true,
      university: true,
      batch: true,
      department: true,

      user: {
        select: {
          email: true,
        },
      },

      skills: {
        select: {
          id: true,

          skill: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      },

      submissions: {
        where: {
          evaluation: {
            is: {
              verified: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          githubLink: true,
          description: true,
          createdAt: true,

          challenge: {
            select: {
              id: true,
              title: true,
              description: true,
              difficulty: true,

              skills: {
                select: {
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                },
              },

              // ==========================================
              // COLLEGE
              // ==========================================

              college: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                  stamp: true,
                },
              },
            },
          },

          evaluation: {
            select: {
              verified: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // ==========================================
  // VERIFIED PROJECTS
  // ==========================================

  const projects = student.submissions.map((submission) => ({
    id: submission.id,

    title: submission.challenge.title,

    description:
      submission.description ||
      submission.challenge.description,

    githubLink: submission.githubLink,

    difficulty: submission.challenge.difficulty,

    createdAt: submission.createdAt,

    verified:
      submission.evaluation?.verified === true,

    // ==========================================
    // PROJECT SKILLS
    // ==========================================

    skills: submission.challenge.skills.map(
      (challengeSkill) => ({
        id: challengeSkill.skill.id,
        name: challengeSkill.skill.name,
        category: challengeSkill.skill.category,
      })
    ),

    // ==========================================
    // COLLEGE INFORMATION
    // ==========================================

    college: submission.challenge.college
      ? {
          id: submission.challenge.college.id,
          name: submission.challenge.college.name,
          logo: submission.challenge.college.logo,
          stamp: submission.challenge.college.stamp,
        }
      : null,
  }));

  // ==========================================
  // RETURN CV DATA
  // ==========================================

  return {
    personal: {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      email: student.user.email,

      // Student profile image
      profile: student.profile,

      headline: student.headline,
      about: student.about,
      phone: student.phone,
      location: student.location,
    },

    education: {
      university: student.university,
      batch: student.batch,
      department: student.department,
    },

    skills: student.skills.map((studentSkill) => ({
      id: studentSkill.skill.id,
      name: studentSkill.skill.name,
      category: studentSkill.skill.category,
    })),

    projects,
  };
};