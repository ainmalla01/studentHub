
// middleware/upload.middleware.js

import multer from "multer";
import { success } from "zod";
import fs from "fs";

/*
|--------------------------------------------------------------------------
| Storage
|--------------------------------------------------------------------------
|
| Files stay in memory as Buffer objects.
| This is useful when uploading directly to Cloudinary or another
| storage service.
|
*/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/public/temp"); // 👈 Folder MUST exist on your system!
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/*
|--------------------------------------------------------------------------
| File Filter
|--------------------------------------------------------------------------
|
| Only image files are accepted.
|
*/
const fileFilter = (req, file, cb) => {
  // Allow images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};


export const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});


export const uploadSingleImage = (fieldName) => {
  return upload.single(fieldName);
};

export const uploadMultipleImages = (
  fieldName,
  maxCount = 5
) => {
  return upload.array(fieldName, maxCount);
};



