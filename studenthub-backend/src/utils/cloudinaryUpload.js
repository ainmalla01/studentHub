
// utils/cloudinaryUpload.js

import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/**
 * Upload a Multer memory-storage file to Cloudinary.
 *
 * @param {Object} file - Multer uploaded file
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadCloud = (
  file,
  folder = "studenthub"
) => {
  return new Promise((resolve, reject) => {
    if (!file?.buffer) {
      return reject(
        new Error("No file provided")
      );
    }

    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    streamifier
      .createReadStream(file.buffer)
      .pipe(stream);
  });
};
