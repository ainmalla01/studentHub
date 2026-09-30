import fs from "fs";
import cloudinary from "../config/cloudinary.js";


// ============================================================
// SHARED
// CLOUDINARY / IMAGE UPLOAD MIDDLEWARE
// ============================================================


// ------------------------------------------------------------
// COLLEGE
// College Logo Upload
// ------------------------------------------------------------

export const colloegepicUpload = async (req, res, next) => {
  try {
    const localFilePath = req.file?.path;

    // Check uploaded file
    if (!localFilePath) {
      return res.status(400).json({
        message: "No file provided",
      });
    }


    // --------------------------------------------------------
    // Upload College Logo to Cloudinary
    // --------------------------------------------------------

    // Debug log to verify process.env is populated
    console.log(
      "Uploading with Key:",
      process.env.CLOUDINARY_API_KEY
    );

    const uploadRes = await cloudinary.uploader.upload(
      localFilePath,
      {
        folder: "studenthub/college/logo",
      }
    );


    // --------------------------------------------------------
    // Clean Up Local Temporary File
    // --------------------------------------------------------

    fs.unlinkSync(localFilePath);


    // --------------------------------------------------------
    // Attach Cloudinary URL to Request
    // --------------------------------------------------------

    req.cloudinaryUrl = uploadRes.secure_url;

    next();

  } catch (error) {

    console.error(
      "Cloudinary upload error:",
      error
    );


    // Clean up local temporary file if upload fails
    if (
      req.file?.path &&
      fs.existsSync(req.file.path)
    ) {
      fs.unlinkSync(req.file.path);
    }


    return res.status(500).json({
      error: error.message,
    });
  }
};


// ------------------------------------------------------------
// STUDENT
// Student Profile Image
// ------------------------------------------------------------

export const getStudentProfile = async (
  req,
  res,
  next
) => {
  try {

    req.cloudinaryUrl = cloudinary.url(
      "studenthub/college/student-profile/profile_s5vxxp",
      {
        secure: true,
        resource_type: "image",
      }
    );

    next();

  } catch (error) {
    next(error);
  }
};