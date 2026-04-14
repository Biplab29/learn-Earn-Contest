import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const imageFormats = ["jpg", "png", "jpeg", "webp"];
const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
const pdfMimeTypes = ["application/pdf"];

const imageFileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error("Only JPG, PNG, JPEG, and WEBP images are allowed"));
};

const createCloudinaryImageUpload = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder,
      allowed_formats: imageFormats,
      resource_type: "image",
    }),
  });

  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  });
};

const contestAssetFileFilter = (req, file, cb) => {
  if (file.fieldname === "image" && imageMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  if (file.fieldname === "projectBriefing" && pdfMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  if (file.fieldname === "projectBriefing") {
    return cb(new Error("Only PDF files are allowed for the project briefing"));
  }

  return cb(new Error("Only contest images and PDF project briefings are allowed"));
};

const contestAssetStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === "projectBriefing") {
      return {
        folder: "contests/briefings",
        allowed_formats: ["pdf"],
        resource_type: "raw",
        format: "pdf",
      };
    }

    return {
      folder: "contests/images",
      allowed_formats: imageFormats,
      resource_type: "image",
    };
  },
});

export const uploadContestAssets = multer({
  storage: contestAssetStorage,
  fileFilter: contestAssetFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const upload = createCloudinaryImageUpload("contests/images");
export const uploadProfilePicture = createCloudinaryImageUpload("users/profile-pictures");


console.log("cloudinary is Working");
