import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Config:");
console.log(cloudinary.config());

const url = cloudinary.url("studenthub/college/student-profile", {
  secure: true,
  resource_type: "image",
});

console.log("Sample Image URL:");
console.log(url);