import * as projectsService from "../../services/college/projects.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getProjects = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const result = await projectsService.getProjects({
    collegeId,
    query: req.query,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { projectId } = req.params;

  const project = await projectsService.getProjectById(
    collegeId,
    projectId
  );

  res.status(200).json({
    success: true,
    data: project,
  });
});

export const reviewProject = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { projectId } = req.params;

  const project = await projectsService.reviewProject({
    collegeId,
    projectId,
    data: req.body,
    reviewerId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Project reviewed successfully",
    data: project,
  });
});