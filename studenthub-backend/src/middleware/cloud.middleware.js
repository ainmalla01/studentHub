import cloudinary from "../config/cloudinary.js";


export const colloegepicUpload = async (req, res, next) => {
  try {
    const localFilePath = req.file?.path;
    if (!localFilePath) {
      return res.status(400).json({ message: "No file provided" });
    }
  // 2. Debug log to verify process.env is actually populated during runtime
    console.log("Uploading with Key:", process.env.CLOUDINARY_API_KEY);

    const uploadRes = await cloudinary.uploader.upload(localFilePath, {
      folder: "studenthub/college/logo",
    });

   // Clean up local temp file after upload
    fs.unlinkSync(localFilePath);

    // Attach response to req object for next handler
    req.cloudinaryUrl = uploadRes.secure_url;
    next();
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    
    // Clean up local temp file if upload fails
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ error: error.message });
  }
};




export const getStudentProfile = async(req,res,next)=>{
    try{
        
 req.cloudinaryUrl = cloudinary.url("studenthub/college/student-profile/profile_s5vxxp", {
  secure: true,
  resource_type: "image",
 
});

 next();
    }catch(error){
next(error);
    }
}