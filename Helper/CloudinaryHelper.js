import cloudinary from "../config/Cloudinary.js";
import { Logger } from "../controllers/Logger.js";
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "sugar_clone/product_pics",
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    Logger.error(
      "Error while uploading to cloudinary",
      { success: false, target: "Image Upload", error: err.message },
      "utilitiesB"
    );
    throw new Error("Error while uploading file");
  }
};

const uploadCarouselImgToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "sugar_clone/carousel_pics",
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    Logger.error(
      "Error while uploading to cloudinary",
      { success: false, target: "Image Upload", error: err.message },
      "utilitiesB"
    );
    throw new Error("Error while uploading file");
  }
};

const uploadCarouselVideoToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "sugar_clone/carousel_video",
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    Logger.error(
      "Error while uploading to cloudinary",
      { success: false, target: "Video Upload", error: err.message },
      "utility"
    );
    throw new Error("Error while uploading file");
  }
};

export {
  uploadCarouselImgToCloudinary,
  uploadToCloudinary,
  uploadCarouselVideoToCloudinary,
};
