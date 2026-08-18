import { Router } from "express";

import {
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityMembers,
} from "../../controller/college/communities.controller.js";

import { protect } from "../../middleware/protected.middleware.js";

const router = Router();

router.get("/", protect, getCommunities);

router.get("/:communityId", protect, getCommunityById);

router.post("/", protect, createCommunity);

router.patch("/:communityId", protect, updateCommunity);

router.delete("/:communityId", protect, deleteCommunity);

router.get(
  "/:communityId/members",
  protect,
  getCommunityMembers
);

export default router;