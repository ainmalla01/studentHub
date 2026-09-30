import { prisma } from "../config/prisma.js";

import { AppError } from "../utils/AppError.js";

import { checkSubmissionEligibility } from "../utils/submission.helper.js";
import { calculateEvaluation } from "../utils/evaluation.calculation.js";
import { createNotification } from "./notification.service.js";
// ============================================================
// SHARED
// SUBMISSION DATA
// ============================================================
const includeSubmission = {
  student: {
    select: {
      id: true,
      studentId: true,
      name: true,
      profile: true,
      batch: true,
      department: true,
      status: true,
      phone: true,
      location: true,
      headline: true,
      about: true,
      university: true,

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
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  },

  challenge: {
    select: {
      id: true,
      title: true,
      description: true,
      instructions: true,
      difficulty: true,
      startDate: true,
      deadline: true,
      submissionType: true,
      status: true,
      departments: true,

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

      rubrics: {
        select: {
          id: true,
          name: true,
          description: true,
          maxScore: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  },

  evaluation: {
    select: {
      id: true,
      total: true,
      feedback: true,
      verified: true,
      createdAt: true,
      updatedAt: true,

      scores: {
        select: {
          id: true,
          rubricId: true,
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
};

const resolveStudent = async (
  studentId,
  studentPublicId
) => {
  const student = studentId
    ? await prisma.student.findUnique({
        where: {
          id: studentId,
        },
      })
    : await prisma.student.findUnique({
        where: {
          studentId: studentPublicId,
        },
      });

  if (!student) {
    throw new AppError(
      404,
      "Student not found."
    );
  }

  if (student.status !== "ACTIVE") {
    throw new AppError(
      400,
      "Inactive students cannot submit work."
    );
  }

  return student;
};


export const createSubmission = async (
  studentId,
  data,
  challengeId
) => {
 
  const student = await resolveStudent(studentId);

  const eligibility =
    await checkSubmissionEligibility(
      student.id,
      challengeId
    );

  if (eligibility.alreadySubmitted) {
    throw new AppError(
      409,
      "You have already submitted this challenge."
    );
  }

  
  if (!eligibility.canSubmit) {
    throw new AppError(
      400,
      "You are not eligible to submit this challenge."
    );
  }
    const challenge = await prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
    select: {
      id: true,
      title: true,
      college: {
        select: {
          userId: true,
        },
      },
    },
  });

  // ----------------------------------------------------------
  // 5. Create submission
  // ----------------------------------------------------------

  const submission =
    await prisma.submission.create({
      data: {
        studentId: student.id,
        challengeId,

        githubLink:
          data.githubLink || null,

        description:
          data.description || null,

        status: "SUBMITTED",
      },

      include: includeSubmission,
    });


      await createNotification({
    userId: challenge.college.userId,

    type: "SUBMISSION_RECEIVED",

    title: "New submission received",

    message: `${student.name} submitted work for "${challenge.title}".`,

    challengeId: challenge.id,

    submissionId: submission.id,
  });



  return submission;
};



export const getStudentSubmissions = async (studentId) => {
  
  return prisma.submission.findMany({
    where: {
      studentId,
    },
    include: includeSubmission,
    orderBy: {
      createdAt: "desc",
    },
  });
};


export const getSubmissions = async (
  params
) => {
  const {
    page,
    limit,
    status,
    challengeId,
    studentId,
  } = params;

  const where = {
    ...(status && status !== "ALL"
      ? {
          status,
        }
      : {}),

    ...(challengeId
      ? {
          challengeId,
        }
      : {}),

    ...(studentId
      ? {
          studentId,
        }
      : {}),
  };

  const [result, total] =
    await prisma.$transaction([
      prisma.submission.findMany({
        where,

        include: includeSubmission,

        orderBy: {
          createdAt: "desc",
        },

        skip: (page - 1) * limit,

        take: limit,
      }),

      prisma.submission.count({
        where,
      }),
    ]);


  return {
    result,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit
      ),
    },
  };
};

export const getSubmissionById = async (id) => {

   const item = await prisma.submission.findUnique(
      { where: { id, }, include: includeSubmission, }); 
  if (!item){ 
    throw new AppError( 404, "Submission not found." ); 

  }
   // Change status when teacher starts reviewing 
   if (item.status === "SUBMITTED") 
    {
       const updatedItem = await prisma.submission.update({ 
        where: { id, }, 
      data: { status: "UNDER_REVIEW", },
       include: includeSubmission, 
      }); 
    
       return updatedItem;
   }
        return item;
   };
      
 


export const getChallengeSubmissions = async (
  challengeId
) => {
  return prisma.submission.findMany({
    where: {
      challengeId,
    },

    include: includeSubmission,

    orderBy: {
      createdAt: "desc",
    },
  });
};


export const evaluateSubmission = async (id, input) => {
  const { scores, feedback } = input;

  return prisma.$transaction(async (tx) => {
 
    const submission = await tx.submission.findUnique({
      where: {
        id,
      },

      include: {
        challenge: {
          include: {
            rubrics: true,

            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new AppError(
        404,
        "Submission not found."
      );
    }

    // 2. Get rubrics

    const rubrics = submission.challenge.rubrics;

    if (rubrics.length === 0) {
      throw new AppError(
        400,
        "This challenge has no rubrics configured."
      );
    }

    // ----------------------------------------------------------
    // 3. Complete evaluation requires every rubric
    // ----------------------------------------------------------
    if (scores.length !== rubrics.length) {
      throw new AppError(
        400,
        "A score must be provided for every rubric."
      );
    }

    // ----------------------------------------------------------
    // 4. Validate every rubric score
    // ----------------------------------------------------------
    for (const item of scores) {
      const rubric = rubrics.find(
        (r) => r.id === item.rubricId
      );

      if (!rubric) {
        throw new AppError(
          400,
          `Rubric ${item.rubricId} does not belong to this challenge.`
        );
      }

      if (
        !Number.isInteger(item.score) ||
        item.score < 0 ||
        item.score > rubric.maxScore
      ) {
        throw new AppError(
          400,
          `Score for "${rubric.name}" must be between 0 and ${rubric.maxScore}.`
        );
      }
    }

    // ----------------------------------------------------------
    // 5. Calculate final evaluation
    // ----------------------------------------------------------
    const calculation = calculateEvaluation(
      rubrics,
      scores
    );

    // ----------------------------------------------------------
    // 6. Find existing evaluation
    // ----------------------------------------------------------
    const existingEvaluation =
      await tx.evaluation.findUnique({
        where: {
          submissionId: id,
        },
      });

    let evaluation;

    if (existingEvaluation) {
      // Remove old rubric scores
      await tx.rubricScore.deleteMany({
        where: {
          evaluationId: existingEvaluation.id,
        },
      });

      evaluation = await tx.evaluation.update({
        where: {
          id: existingEvaluation.id,
        },

        data: {
          total: calculation.total,
          feedback: feedback || null,

          scores: {
            create: scores.map((item) => ({
              rubricId: item.rubricId,
              score: item.score,
              feedback: item.feedback || null,
            })),
          },
        },

        include: {
          scores: {
            include: {
              rubric: true,
            },
          },
        },
      });
    }

    else {
      evaluation = await tx.evaluation.create({
        data: {
          submissionId: id,
          total: calculation.total,
          feedback: feedback || null,

          scores: {
            create: scores.map((item) => ({
              rubricId: item.rubricId,
              score: item.score,
              feedback: item.feedback || null,
            })),
          },
        },

        include: {
          scores: {
            include: {
              rubric: true,
            },
          },
        },
      });
    }

    const updatedSubmission =
      await tx.submission.update({
        where: {
          id,
        },

        data: {
          status: "EVALUATED",
        },

        include: includeSubmission,
      });


  

    const studentSkillsToCreate =
      submission.challenge.skills.map(
        (challengeSkill) => ({
          studentId: submission.studentId,
          skillId: challengeSkill.skillId,
         
        })
      );

    if (studentSkillsToCreate.length > 0) {
      await tx.studentSkill.createMany({
        data: studentSkillsToCreate,

        skipDuplicates: true,
      });
    }

    // ----------------------------------------------------------
    // 11. Return complete result
    // ----------------------------------------------------------
    return {
      submission: updatedSubmission,
      evaluation,
      calculation,
    };
  });
};



export const markUnderReview = async (
  id
) => {
  await getSubmissionById(id);

  return prisma.submission.update({
    where: {
      id,
    },

    data: {
      status: "UNDER_REVIEW",
    },

    include: includeSubmission,
  });
};



export const getSubmissionStatistics =
  async () => {
    const [
      submitted,
      underReview,
      evaluated,
      average,
    ] = await Promise.all([
     
      prisma.submission.count({
        where: {
          status: "SUBMITTED",
        },
      }),


      prisma.submission.count({
        where: {
          status: "UNDER_REVIEW",
        },
      }),


      prisma.submission.count({
        where: {
          status: "EVALUATED",
        },
      }),

   
      prisma.submission.aggregate({
        where: {
          score: {
            not: null,
          },
        },

        _avg: {
          score: true,
        },
      }),
    ]);

    return {
      submitted,
      underReview,
      evaluated,

      averageScore: Number(
        (
          average._avg.score ?? 0
        ).toFixed(2)
      ),
    };
  };


  

export const verifySubmission = async (id) => {
  const submission = await prisma.submission.findUnique({
    where: {
      id,
    },
    include: {
      evaluation: true,
    },
  });

  if (!submission) {
    throw new AppError(404, "Submission not found.");
  }

  if (!submission.evaluation) {
    throw new AppError(
      400,
      "Submission must be evaluated before verification."
    );
  }

  if (submission.status !== "EVALUATED") {
    throw new AppError(
      400,
      "Only evaluated submissions can be verified."
    );
  }

  if (submission.evaluation.verified) {
    throw new AppError(
      400,
      "Submission is already verified."
    );
  }

  return prisma.evaluation.update({
    where: {
      submissionId: id,
    },
    data: {
      verified: true,
    },
    include: {
      scores: {
        include: {
          rubric: true,
        },
      },
    },
  });
};
