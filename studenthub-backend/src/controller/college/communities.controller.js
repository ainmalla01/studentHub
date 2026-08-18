import * as communitiesService from "../../services/college/communities.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getCommunities = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const result = await communitiesService.getCommunities({
    collegeId,
    query: req.query,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getCommunityById = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { communityId } = req.params;

  const community = await communitiesService.getCommunityById(
    collegeId,
    communityId
  );

  res.status(200).json({
    success: true,
    data: community,
  });
});

export const createCommunity = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const community = await communitiesService.createCommunity({
    collegeId,
    creatorId: req.user.id,
    data: req.body,
  });

  res.status(201).json({
    success: true,
    message: "Community created successfully",
    data: community,
  });
});

export const updateCommunity = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { communityId } = req.params;

  const community = await communitiesService.updateCommunity({
    collegeId,
    communityId,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Community updated successfully",
    data: community,
  });
});

export const deleteCommunity = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { communityId } = req.params;

  await communitiesService.deleteCommunity(
    collegeId,
    communityId
  );

  res.status(200).json({
    success: true,
    message: "Community deleted successfully",
  });
});

export const getCommunityMembers = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { communityId } = req.params;

  const members =
    await communitiesService.getCommunityMembers(
      collegeId,
      communityId
    );

  res.status(200).json({
    success: true,
    data: members,
  });
});