import multer from "multer";
import { AppError } from "../utils/AppError.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) return cb(null, true);
  return cb(new AppError(400, "Only JPEG, PNG or WebP images are allowed."));
};

/** Files are kept in memory and streamed to Cloudinary - nothing is written to disk. */
export const uploadSingleImage = (fieldName) =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  }).single(fieldName);
