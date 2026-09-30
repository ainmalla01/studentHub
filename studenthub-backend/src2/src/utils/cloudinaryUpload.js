import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { cloudinaryConfigured } from "../config/env.js";
import { AppError } from "./AppError.js";

/**
 * Upload a Multer disk-storage image to Cloudinary.
 * Accepts a Multer file (uses file.path) and removes the temp file afterwards.
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export const uploadImage = (file, folder = "studenthub") => {
  if (!cloudinaryConfigured) {
    throw new AppError(
      503,
      "Image uploads are not configured on this server."
    );
  }

  if (!file?.path) {
    throw new AppError(400, "No file provided.");
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      { folder, resource_type: "image" },
      (error, result) => {
        // Always clean up the temporary local file.
        fs.promises.unlink(file.path).catch(() => {});

        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
  });
};

export default uploadImage;
