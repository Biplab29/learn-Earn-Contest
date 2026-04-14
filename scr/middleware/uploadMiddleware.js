import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const allowedFormats = ["jpg", "png", "jpeg", "webp"];
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error("Only JPG, PNG, JPEG, and WEBP images are allowed"));
};

const createCloudinaryUpload = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder,
      allowed_formats: allowedFormats,
      resource_type: "image",
    }),
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  });
};

export const upload = createCloudinaryUpload("contests");
export const uploadProfilePicture = createCloudinaryUpload("users/profile-pictures");


console.log("cloudinary is Working");
