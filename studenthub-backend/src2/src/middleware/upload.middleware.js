import multer from "multer";
import fs from "fs";


// ============================================================
// SHARED
// FILE UPLOAD MIDDLEWARE
// ============================================================


// ------------------------------------------------------------
// STORAGE
// Files are temporarily stored on disk before being uploaded
// to Cloudinary or another storage service.
// ------------------------------------------------------------

const storage = multer.diskStorage({

  // Temporary upload directory
  // Folder MUST exist on the system
  destination: function (req, file, cb) {
    cb(null, "./src/public/temp");
  },

  // Generate unique filename
  filename: function (req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  },
});


// ------------------------------------------------------------
// FILE FILTER
// Only image files are accepted.
// ------------------------------------------------------------

const fileFilter = (req, file, cb) => {

  // Allow images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files are allowed!"),
      false
    );
  }
};


// ------------------------------------------------------------
// MULTER UPLOAD CONFIGURATION
// Maximum file size: 5 MB
// ------------------------------------------------------------

export const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// ------------------------------------------------------------
// SINGLE IMAGE UPLOAD
// ------------------------------------------------------------

export const uploadSingleImage = (fieldName) => {
  return upload.single(fieldName);
};


// ------------------------------------------------------------
// MULTIPLE IMAGE UPLOAD
// Default maximum: 5 images
// ------------------------------------------------------------

export const uploadMultipleImages = (
  fieldName,
  maxCount = 5
) => {
  return upload.array(fieldName, maxCount);
};