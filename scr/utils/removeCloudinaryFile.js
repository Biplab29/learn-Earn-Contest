// import cloudinary from "../config/cloudinary.js";

// const removeCloudinaryFile = async (fileOrPublicId, options = {}) => {
//   const publicId =
//     typeof fileOrPublicId === "string" ? fileOrPublicId : fileOrPublicId?.filename;

//   if (!publicId) {
//     return;
//   }

//   try {
//     await cloudinary.uploader.destroy(publicId, {
//       invalidate: true,
//       resource_type: options.resourceType || "image",
//     });
//   } catch (error) {
//     console.error("CLOUDINARY CLEANUP ERROR:", error.message);
//   }
// };

// export default removeCloudinaryFile;


import cloudinary from "../config/cloudinary.js";

// =====================================================
// REMOVE CLOUDINARY FILE
// বাংলা: cloudinary থেকে file delete করবে
// English: delete file from cloudinary
// =====================================================
const removeCloudinaryFile = async (fileOrPublicId, options = {}) => {

  // বাংলা: string হলে publicId, না হলে file object থেকে filename
  // English: extract publicId from string or file object
  const publicId =
    typeof fileOrPublicId === "string"
      ? fileOrPublicId
      : fileOrPublicId?.filename;

  // বাংলা: publicId না থাকলে কিছু করবে না
  // English: skip if no publicId
  if (!publicId) return;

  // বাংলা: যদি ভুল করে full URL দেওয়া হয় → skip
  // English: skip if URL passed instead of publicId
  if (publicId.includes("http")) return;

  try {
    // বাংলা: cloudinary delete call
    // English: delete asset from cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: options.resourceType || "auto", // 🔥 important change
    });

    return result;
  } catch (error) {
    console.error("CLOUDINARY CLEANUP ERROR:", error.message);
  }
};

export default removeCloudinaryFile;

console.log("cloudinary is Working");

