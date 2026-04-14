import cloudinary from "../config/cloudinary.js";

const removeCloudinaryFile = async (file) => {
  if (!file?.filename) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(file.filename, { invalidate: true });
  } catch (error) {
    console.error("CLOUDINARY CLEANUP ERROR:", error.message);
  }
};

export default removeCloudinaryFile;
