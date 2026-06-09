


import cloudinary from "../config/cloudinary.js";

// =====================================================
// REMOVE CLOUDINARY FILE
// delete file from cloudinary
// =====================================================
const removeCloudinaryFile = async (fileOrPublicId, options = {}) => {


  // extract publicId from string or file object
  const publicId =
    typeof fileOrPublicId === "string"
      ? fileOrPublicId
      : fileOrPublicId?.filename;

  // skip if no publicId
  if (!publicId) return;

  //skip if URL passed instead of publicId
  if (publicId.includes("http")) return;

  try {
    //delete asset from cloudinary
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

