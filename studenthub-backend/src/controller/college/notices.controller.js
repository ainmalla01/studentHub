import * as noticesService from "../../services/college/notices.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getNotices = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const result = await noticesService.getNotices({
    collegeId,
    query: req.query,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getNoticeById = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { noticeId } = req.params;

  const notice = await noticesService.getNoticeById(
    collegeId,
    noticeId
  );

  res.status(200).json({
    success: true,
    data: notice,
  });
});

export const createNotice = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;

  const notice = await noticesService.createNotice({
    collegeId,
    authorId: req.user.id,
    data: req.body,
  });

  res.status(201).json({
    success: true,
    message: "Notice created successfully",
    data: notice,
  });
});

export const updateNotice = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { noticeId } = req.params;

  const notice = await noticesService.updateNotice({
    collegeId,
    noticeId,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Notice updated successfully",
    data: notice,
  });
});

export const deleteNotice = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  const { noticeId } = req.params;

  await noticesService.deleteNotice(collegeId, noticeId);

  res.status(200).json({
    success: true,
    message: "Notice deleted successfully",
  });
});