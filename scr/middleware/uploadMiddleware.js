// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// const imageFormats = ["jpg", "png", "jpeg", "webp"];
// const imageMimeTypes = [
//   "image/jpeg",
//   "image/png",
//   "image/webp",
// ];
// const pdfMimeTypes = ["application/pdf"];
// const contestBriefingFieldNames = ["projectBriefing", "projectBriefingPdf"];

// const isContestBriefingField = (fieldName) =>
//   contestBriefingFieldNames.includes(fieldName);

// const imageFileFilter = (req, file, cb) => {
//   if (imageMimeTypes.includes(file.mimetype)) {
//     return cb(null, true);
//   }

//   return cb(new Error("Only JPG, PNG, JPEG, and WEBP images are allowed"));
// };

// const createCloudinaryImageUpload = (folder) => {
//   const storage = new CloudinaryStorage({
//     cloudinary,
//     params: async () => ({
//       folder,
//       allowed_formats: imageFormats,
//       resource_type: "image",
//     }),
//   });

//   return multer({
//     storage,
//     fileFilter: imageFileFilter,
//     limits: {
//       fileSize: 2 * 1024 * 1024,
//     },
//   });
// };

// const contestAssetFileFilter = (req, file, cb) => {
//   if (file.fieldname === "image" && imageMimeTypes.includes(file.mimetype)) {
//     return cb(null, true);
//   }

//   if (
//     isContestBriefingField(file.fieldname) &&
//     pdfMimeTypes.includes(file.mimetype)
//   ) {
//     return cb(null, true);
//   }

//   if (isContestBriefingField(file.fieldname)) {
//     return cb(new Error("Only PDF files are allowed for the project briefing"));
//   }

//   return cb(new Error("Only contest images and PDF project briefings are allowed"));
// };

// const contestAssetStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     if (isContestBriefingField(file.fieldname)) {
//       return {
//         folder: "contests/briefings",
//         allowed_formats: ["pdf"],
//         resource_type: "raw",
//         format: "pdf",
//       };
//     }

//     return {
//       folder: "contests/images",
//       allowed_formats: imageFormats,
//       resource_type: "image",
//     };
//   },
// });

// export const uploadContestAssets = multer({
//   storage: contestAssetStorage,
//   fileFilter: contestAssetFileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024,
//   },
// });

// export const contestBriefingUploadFields = contestBriefingFieldNames;
// export const upload = createCloudinaryImageUpload("contests/images");
// export const uploadProfilePicture = createCloudinaryImageUpload("users/profile-pictures");


// console.log("cloudinary is Working");



import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";


// =====================================================
// ALLOWED FORMATS
// বাংলা: allowed image and pdf file types
// English: allowed mime types and formats
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


// =====================================================
// CHECK CONTEST BRIEFING FIELD
// বাংলা: field name contest briefing কিনা check করবে
// English: check whether field is a contest briefing field
// =====================================================
const isContestBriefingField = (fieldName) =>
  contestBriefingFieldNames.includes(fieldName);


// =====================================================
// IMAGE FILE FILTER
// বাংলা: image file valid কিনা check
// English: validate uploaded image file
// =====================================================
const imageFileFilter = (req, file, cb) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
};


// =====================================================
// CREATE CLOUDINARY IMAGE UPLOAD
// বাংলা: সাধারণ image upload middleware তৈরি করবে
// English: create multer middleware for image upload
// =====================================================
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


// =====================================================
// CONTEST ASSET FILE FILTER
// বাংলা: contest image + pdf briefing validate করবে
// English: validate contest image and project briefing pdf
// =====================================================
const contestAssetFileFilter = (req, file, cb) => {
  // বাংলা: contest image হলে image mime type check
  // English: allow valid contest image
  if (file.fieldname === "image" && imageMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  // বাংলা: contest briefing field হলে pdf allow
  // English: allow PDF for contest briefing fields
  if (
    isContestBriefingField(file.fieldname) &&
    pdfMimeTypes.includes(file.mimetype)
  ) {
    return cb(null, true);
  }

  // বাংলা: briefing field-এ non-pdf reject
  // English: reject non-pdf briefing file
  if (isContestBriefingField(file.fieldname)) {
    return cb(new Error("Only PDF files are allowed for the project briefing"));
  }

  // বাংলা: অন্য unsupported file reject
  // English: reject unsupported contest asset
  return cb(
    new Error("Only contest images and PDF project briefings are allowed")
  );
};


// =====================================================
// CONTEST ASSET STORAGE
// বাংলা: contest image আর pdf আলাদা cloudinary folder-এ save হবে
// English: store contest image and briefing in separate cloudinary folders
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


// =====================================================
// EXPORT MIDDLEWARES
// বাংলা: বিভিন্ন upload middleware export করা হচ্ছে
// English: export reusable upload middlewares
// =====================================================
export const uploadContestAssets = multer({
  storage: contestAssetStorage,
  fileFilter: contestAssetFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const contestBriefingUploadFields = contestBriefingFieldNames;

// বাংলা: সাধারণ contest image upload
// English: single image upload for contest
export const upload = createCloudinaryImageUpload("contests/images");

// বাংলা: user profile picture upload
// English: upload profile picture
export const uploadProfilePicture = createCloudinaryImageUpload(
  "users/profile-pictures"
);

console.log("upload middleware is working");