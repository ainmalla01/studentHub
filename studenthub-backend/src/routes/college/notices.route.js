import { Router } from "express";

import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../../controller/college/notices.controller.js";

import { protect } from "../../middleware/protected.middleware.js";

const router = Router();

router.get("/", protect, getNotices);

router.get("/:noticeId", protect, getNoticeById);

router.post("/", protect, createNotice);

router.patch("/:noticeId", protect, updateNotice);

router.delete("/:noticeId", protect, deleteNotice);

export default router;