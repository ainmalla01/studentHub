
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const getStudentProfile = async (userId) => {
  const student = await prisma.student.findUnique({
    where: {
      userId,
    },

    include: {
      user: {
        select: {
          email: true,
        },
      },

      // Student skills
      skills: {
        include: {
          skill: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      },

      // Student submissions
      submissions: {
        // Only completed evaluations are fetched
        where: {
          status: "EVALUATED",
        },

        include: {
          challenge: {
            select: {
              id: true,
              title: true,
              description: true,
              difficulty: true,
              submissionType: true,
              status: true,

              // Skills required by the challenge
              skills: {
                include: {
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                },
              },

              // College that created the challenge
              college: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },

          // Complete evaluation information
          evaluation: {
            select: {
              id: true,
              total: true,
              feedback: true,
              verified: true,
              createdAt: true,
              updatedAt: true,

              // Individual rubric scores
              scores: {
                select: {
                  id: true,
                  score: true,
                  feedback: true,

                  rubric: {
                    select: {
                      id: true,
                      name: true,
                      description: true,
                      maxScore: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      // Challenge participations
      participations: {
        select: {
          id: true,
          createdAt: true,

          challenge: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              status: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!student) {
    throw new AppError("Student profile not found", 404);
  }

  // ============================================================
  // COMPLETED PROJECTS
  // ============================================================
  //
  // Because submissions are already filtered by:
  //
  // status: "EVALUATED"
  //
  // draft / UNDER_REVIEW submissions will never appear here.
  //
  const completedProjects = student.submissions
    .filter((submission) => submission.evaluation)
    .map((submission) => {
      const evaluation = submission.evaluation;

      // Calculate maximum score from the challenge rubrics
      const maximumScore = evaluation.scores.reduce(
        (sum, item) => sum + item.rubric.maxScore,
        0
      );

      // Calculate percentage
      const percentage =
        maximumScore > 0
          ? Number(
              ((evaluation.total / maximumScore) * 100).toFixed(2)
            )
          : 0;

      // Calculate grade
      let grade = "F";

      if (percentage >= 90) {
        grade = "A+";
      } else if (percentage >= 80) {
        grade = "A";
      } else if (percentage >= 70) {
        grade = "B+";
      } else if (percentage >= 60) {
        grade = "B";
      } else if (percentage >= 50) {
        grade = "C+";
      } else if (percentage >= 40) {
        grade = "C";
      }

      return {
        id: submission.id,

        title: submission.challenge.title,

        description:
          submission.description ||
          submission.challenge.description,

        githubLink: submission.githubLink,

        difficulty: submission.challenge.difficulty,

        // Challenge skills
        skills: submission.challenge.skills.map(
          (challengeSkill) => ({
            id: challengeSkill.skill.id,
            name: challengeSkill.skill.name,
            category: challengeSkill.skill.category,
          })
        ),

        // Evaluation information
        evaluation: {
          id: evaluation.id,

          total: evaluation.total,

          maximumScore,

          percentage,

          grade,

          feedback: evaluation.feedback,

          verified: evaluation.verified,

          evaluatedAt: evaluation.updatedAt,

          // Individual rubric results
          scores: evaluation.scores.map((score) => ({
            id: score.id,

            rubricId: score.rubric.id,

            rubricName: score.rubric.name,

            rubricDescription: score.rubric.description,

            maxScore: score.rubric.maxScore,

            score: score.score,

            feedback: score.feedback,
          })),
        },

        // Easy access for frontend
        verified: evaluation.verified,

        // College information
        college: submission.challenge.college
          ? {
              id: submission.challenge.college.id,
              name: submission.challenge.college.name,
              logo: submission.challenge.college.logo,
            }
          : null,
      };
    });

  // ============================================================
  // RETURN STUDENT PROFILE
  // ============================================================

  return {
    profile: {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      email: student.user.email,
      profile: student.profile,
      headline: student.headline,
      about: student.about,
      phone: student.phone,
      location: student.location,
      university: student.university,
      batch: student.batch,
      department: student.department,
      status: student.status,
      isVerified: student.isVerified,
    },

    // Student's existing skills
    skills: student.skills.map((studentSkill) => ({
      id: studentSkill.skill.id,
      name: studentSkill.skill.name,
      category: studentSkill.skill.category,
      level: studentSkill.level,
      score: studentSkill.score,
    })),

    // Completed + evaluated challenges
    projects: completedProjects,

    // Challenges the student participated in
    participations: student.participations,
  };
};
// ============================================================
// GET COLLEGE PROFILE
// ============================================================

export const getCollegeProfile = async (userId) => {
  const college = await prisma.college.findUnique({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!college) {
    throw new AppError("College profile not found", 404);
  }

  return {
    profile: {
      id: college.id,
      userId: college.userId,
      name: college.name,
      email: college.user.email,
      phone: college.phone,
      location: college.location,
      logo: college.logo,
      stamp: college.stamp,
      adbout: college.about,
      role: college.user.role,
    },
  };
};


// ============================================================
// UPDATE COLLEGE PROFILE
// ============================================================
export const updateCollegeProfile = async (userId, data) => {
  const college = await prisma.college.findUnique({
    where: {
      userId,
    },
  });

  if (!college) {
    throw new AppError("College profile not found", 404);
  }

  const updatedCollege = await prisma.college.update({
    where: {
      userId,
    },

    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.phone !== undefined && {
        phone: data.phone,
      }),

      ...(data.location !== undefined && {
        location: data.location,
      }),

      ...(data.about !== undefined && {
        about: data.about,
      }),

      ...(data.logo !== undefined && {
        logo: data.logo,
      }),

      ...(data.stamp !== undefined && {
        stamp: data.stamp,
      }),
    },

    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return {
    profile: {
      id: updatedCollege.id,
      userId: updatedCollege.userId,
      name: updatedCollege.name,
      email: updatedCollege.user.email,
      phone: updatedCollege.phone,
      location: updatedCollege.location,
      about: updatedCollege.about,
      logo: updatedCollege.logo,
      stamp: updatedCollege.stamp,
      role: updatedCollege.user.role,
    },
  };
};
// ============================================================
// DELETE COLLEGE ACCOUNT
// ============================================================

export const deleteCollegeProfile = async (userId) => {
  const college = await prisma.college.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!college) {
    throw new AppError("College profile not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    // Delete college
    await tx.college.delete({
      where: {
        userId,
      },
    });

    // Delete associated user account
    await tx.user.delete({
      where: {
        id: userId,
      },
    });
  });

  return {
    id: college.id,
    userId: college.userId,
  };
};