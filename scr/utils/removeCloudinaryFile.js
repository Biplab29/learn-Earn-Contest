import cloudinary from "../config/cloudinary.js";

const removeCloudinaryFile = async (fileOrPublicId, options = {}) => {
  const publicId =
    typeof fileOrPublicId === "string" ? fileOrPublicId : fileOrPublicId?.filename;

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: options.resourceType || "image",
    });
  } catch (error) {
    console.error("CLOUDINARY CLEANUP ERROR:", error.message);
  }
};

export default removeCloudinaryFile;
