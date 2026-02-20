import {
  CarouselImageSchema,
  CarouselVideoSchema,
} from "../models/CarouselSchema.js";
import { MarqeeSchema } from "../models/MarqueeSchema.js";
import { Logger } from "./Logger.js";
import fs from "fs";
import {
  uploadCarouselImgToCloudinary,
  uploadCarouselVideoToCloudinary,
} from "../Helper/CloudinaryHelper.js";

const createImageCarousel = async (req, res) => {
  try {
    if (!req.file) {
      Logger.error(
        "Image is required",
        { success: false, target: "Carousel" },
        "utility"
      );
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    //upload to cloudinary
    const { url, public_id } = await uploadCarouselImgToCloudinary(
      req.file.path
    );

    //extract other details from request body
    const { alt, category } = req.body;

    const newCarouselImage = new CarouselImageSchema({
      alt,
      imgUrl: url,
      publicId: public_id,
      category,
    });

    const savedImage = await newCarouselImage.save();

    fs.unlinkSync(req.file.path);

    Logger.info(
      "Carousel created successfully",
      {
        success: true,
        target: "Carousel Controller",
        carouselID: savedImage._id,
      },
      "utility"
    );

    return res.status(201).json({
      success: true,
      message: "Carousel created successfully",
      data: savedImage,
    });
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    Logger.error(
      "Something went wrong while creating carousel pictures",
      { error: err.message, stack: err.stack },
      "utility"
    );
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating picturest",
      error: err.message,
    });
  }
};

const createVideoCarousel = async (req, res) => {
  try {
    if (!req.file) {
      Logger.error(
        "Video is required",
        { success: false, target: "Carousel" },
        "utility"
      );
      return res
        .status(400)
        .json({ success: false, message: "Video is required" });
    }

    //upload to cloudinary
    const { url, publicId } = await uploadCarouselVideoToCloudinary(
      req.file.path
    );

    //extract other details from request body
    const { description, category } = req.body;

    const newCarouselVideo = new CarouselVideoSchema({
      description,
      vedioUrl: url,
      publicId,
      category,
    });

    const savedVideo = await newCarouselVideo.save();

    fs.unlinkSync(req.file.path);

    Logger.info(
      "Carousel video created successfully",
      {
        success: true,
        target: "Carousel",
        carouselID: savedVideo._id,
      },
      "utility"
    );

    res.status(201).json({
      success: true,
      message: "Carousel Video created successfully",
      data: savedVideo,
    });
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    Logger.error(
      "Something went wrong while creating carousel vedio",
      { error: err.message, stack: err.stack },
      "utility"
    );
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating carousel vedio",
      error: err.message,
    });
  }
};

export { createImageCarousel, createVideoCarousel };
