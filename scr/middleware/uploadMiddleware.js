
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// ALLOWED FORMATS
// allowed image and pdf file types
// allowed mime types and formats
// =====================================================
const imageFormats = ["jpg", "jpeg", "png", "webp"];

const imageMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const pdfMimeTypes = ["application/pdf"];

const contestBriefingFieldNames = ["projectBriefing", "projectBriefingPdf"];



const isContestBriefingField = (fieldName) =>
  contestBriefingFieldNames.includes(fieldName);

//validate uploaded image file

const imageFileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
};

//create multer middleware for image upload

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
      fileSize: 2 * 1024 * 1024, // 2MB
    },
  });
};

// validate contest image and project briefing pdf
// =====================================================
const contestAssetFileFilter = (req, file, cb) => {
  // বাংলা: contest image হলে image mime type check
  // English: allow valid contest image
  if (file.fieldname === "image" && imageMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  if (
    isContestBriefingField(file.fieldname) &&
    pdfMimeTypes.includes(file.mimetype)
  ) {
    return cb(null, true);
  }

  if (isContestBriefingField(file.fieldname)) {
    return cb(new Error("Only PDF files are allowed for the project briefing"));
  }

  
  return cb(
    new Error("Only contest images and PDF project briefings are allowed")
  );
};


// store contest image and briefing in separate cloudinary folders
// =====================================================
const contestAssetStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (isContestBriefingField(file.fieldname)) {
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


//export reusable upload middlewares

export const uploadContestAssets = multer({
  storage: contestAssetStorage,
  fileFilter: contestAssetFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const contestBriefingUploadFields = contestBriefingFieldNames;


export const upload = createCloudinaryImageUpload("contests/images");


export const uploadProfilePicture = createCloudinaryImageUpload(
  "users/profile-pictures"
);

console.log("upload middleware is working");