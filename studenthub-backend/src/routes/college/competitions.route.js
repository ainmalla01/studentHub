import { Router } from "express";

import {
  getCompetitions,
  getCompetitionById,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getCompetitionParticipants,
  getCompetitionLeaderboard,
} from "../../controller/college/competitions.controller.js";

import { protect } from "../../middleware/protected.middleware.js";

const router = Router();

router.get("/", protect, getCompetitions);

router.get("/:competitionId", protect, getCompetitionById);

router.post("/", protect, createCompetition);

router.patch("/:competitionId", protect, updateCompetition);

router.delete("/:competitionId", protect, deleteCompetition);

router.get(
  "/:competitionId/participants",
  protect,
  getCompetitionParticipants
);

router.get(
  "/:competitionId/leaderboard",
  protect,
  getCompetitionLeaderboard
);

export default router;