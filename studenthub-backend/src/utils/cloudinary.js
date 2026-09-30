import { v2 as cloudinary } from "cloudinary";

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Default student profile image
export const studentDefult_image = async () => {
  configureCloudinary();

  const url = cloudinary.url("profile_s5vxxp", {
    secure: true,
    resource_type: "image",
  });

  return url;
};

// Upload college logo
export const uploadCollegeLogo = async (file) => {
  configureCloudinary();

  if (!file) {
    throw new Error("College logo image is required");
  }

  const result = await cloudinary.uploader.upload(file, {
    folder: "studenthub/college/logo",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

// Upload college stamp/signature
export const uploadCollegeStamp = async (file) => {
  configureCloudinary();

  if (!file) {
    throw new Error("College stamp image is required");
  }

  const result = await cloudinary.uploader.upload(file, {
    folder: "studenthub/college/stamp",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export default cloudinary;