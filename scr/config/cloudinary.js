// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";

// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET
// });

// export default cloudinary;


import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();


// =====================================================
// VALIDATE ENV VARIABLES
// বাংলা: cloudinary env variables আছে কিনা check
// English: ensure required env variables exist
// =====================================================
if (
  !process.env.CLOUD_NAME ||
  !process.env.CLOUD_API_KEY ||
  !process.env.CLOUD_API_SECRET
) {
  throw new Error("Cloudinary environment variables are missing");
}


// =====================================================
// CONFIGURE CLOUDINARY
// বাংলা: cloudinary config setup
// English: initialize cloudinary configuration
// =====================================================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

export default cloudinary;

console.log("Cloudinary config loaded");