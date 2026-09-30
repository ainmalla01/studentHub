import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import { cloudinaryConfigured } from "../config/env.js";
import { AppError } from "./AppError.js";

/**
 * Upload a Multer memory-storage image to Cloudinary.
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadImage = (file, folder = "studenthub") => {
  if (!cloudinaryConfigured) {
    throw new AppError(503, "Image uploads are not configured on this server.");
  }
  if (!file?.buffer) {
    throw new AppError(400, "No file provided.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};
