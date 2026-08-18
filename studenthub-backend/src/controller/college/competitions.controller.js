import * as competitionsService from "../../services/college/competitions.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getCompetitions = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const result = await competitionsService.getCompetitions({
    collegeId,
    query: req.query,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getCompetitionById = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { competitionId } = req.params;

  const competition =
    await competitionsService.getCompetitionById(
      collegeId,
      competitionId
    );

  res.status(200).json({
    success: true,
    data: competition,
  });
});

export const createCompetition = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const competition =
    await competitionsService.createCompetition({
      collegeId,
      creatorId: req.user.id,
      data: req.body,
    });

  res.status(201).json({
    success: true,
    message: "Competition created successfully",
    data: competition,
  });
});

export const updateCompetition = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { competitionId } = req.params;

  const competition =
    await competitionsService.updateCompetition({
      collegeId,
      competitionId,
      data: req.body,
    });

  res.status(200).json({
    success: true,
    message: "Competition updated successfully",
    data: competition,
  });
});

export const deleteCompetition = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { competitionId } = req.params;

  await competitionsService.deleteCompetition(
    collegeId,
    competitionId
  );

  res.status(200).json({
    success: true,
    message: "Competition deleted successfully",
  });
});

export const getCompetitionParticipants = asyncHandler(
  async (req, res) => {
    const collegeId = req.user.collegeId;
    const { competitionId } = req.params;

    const participants =
      await competitionsService.getCompetitionParticipants(
        collegeId,
        competitionId
      );

    res.status(200).json({
      success: true,
      data: participants,
    });
  }
);

export const getCompetitionLeaderboard = asyncHandler(
  async (req, res) => {
    const collegeId = req.user.collegeId;
    const { competitionId } = req.params;

    const leaderboard =
      await competitionsService.getCompetitionLeaderboard(
        collegeId,
        competitionId
      );

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  }
);