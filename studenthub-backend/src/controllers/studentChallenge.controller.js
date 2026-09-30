import { z } from "zod";

import * as service from "../services/studentChallenge.service.js";

import { ok } from "../utils/response.js";


import {
  challengeQuerySchema,
} from "../validators/challenge.validator.js";

// ------------------------------------------------------------
// Shared
// Challenge ID Validation
// ------------------------------------------------------------

const idSchema = z.object({
  challengeId: z.string().uuid(),
});

// ============================================================
// STUDENT CHALLENGES
// ============================================================

export const getStudentChallenges = async (req, res) => {
  const query = challengeQuerySchema.parse(req.query);

  const studentId = req.user.studentId;

  const result = await service.getStudentChallenges(
    query,
    studentId
  );
console.log("controller after the service: ",result)
  return ok(
    res,
    result,
    "Student challenges fetched successfully"
  );
};

// ------------------------------------------------------------
// Get Student Challenges
// Student → Challenges
// ------------------------------------------------------------
export const getParticipateChallengeList = async (req, res) => {
  const studentId = req.user.studentId;

  const result = await service.getParticipateChallengeList(studentId);

  return res.status(200).json({
    success: true,
    result,
  });
};
// ------------------------------------------------------------
// Get Student Challenge Details
// Student → Challenges → Details
// ------------------------------------------------------------

// export const getStudentChallenge = async (
//   req,
//   res
// ) => {
//   const challengeId =
//     idSchema.parse(req.params).challengeId;

//   console.log(
//     "➡️ [CONTROLLER] getStudentChallenge hit"
//   );

//   console.log(
//     "🆔 Challenge ID:",
//     challengeId
//   );

//   console.log(
//     "👤 Student ID:",
//     req.user?.studentId
//   );

//   const result =
//     await service.getStudentChallenge(
//       challengeId,
//       req.user.studentId
//     );

//   return ok(
//     res,
//     result,
//     "Challenge fetched successfully."
//   );
// };

// ============================================================
// PARTICIPATION
// ============================================================

// ------------------------------------------------------------
// Participate In Challenge
// Student → Challenge → Participate
// ------------------------------------------------------------

export const participateInChallenge = async (
  req,
  res
) => {
  const challengeId =
    idSchema.parse(req.params).challengeId;

  console.log(
    "➡️ [CONTROLLER] participateInChallenge hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  console.log(
    "👤 Student ID:",
    req.user?.studentId
  );

  const result =
    await service.participateInChallenge(
      req.user.studentId,
      challengeId
    );

  return ok(
    res,
    result,
    "Successfully participated in challenge.",
    201
  );
};

// ------------------------------------------------------------
// Check Participation
// Student → Challenge → Participation Status
// ------------------------------------------------------------

export const checkParticipation = async (
  req,
  res
) => {
  const challengeId =
    idSchema.parse(req.params).id;

  console.log(
    "➡️ [CONTROLLER] checkParticipation hit"
  );

  console.log(
    "🆔 Challenge ID:",
    challengeId
  );

  console.log(
    "👤 Student ID:",
    req.user?.studentId
  );

  const result =
    await service.checkParticipation(
      req.user.studentId,
      challengeId
    );

  return ok(
    res,
    result,
    "Participation status fetched successfully."
  );
};

// ============================================================
// STUDENT SUBMISSIONS
// ============================================================

// ------------------------------------------------------------
// Get My Submissions
// Student → Submissions
// ------------------------------------------------------------

export const getMySubmissions = async (
  req,
  res
) => {
  console.log(
    "➡️ [CONTROLLER] getMySubmissions hit"
  );

  console.log(
    "👤 Student ID:",
    req.user?.studentId
  );

  const result =
    await service.getMySubmissions(
      req.user.studentId,
      req.query
    );

  return ok(
    res,
    result,
    "Student submissions fetched successfully."
  );
};
