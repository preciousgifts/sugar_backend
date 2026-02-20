import express from "express";
import { getAllLogs } from "../controllers/Logger.js";
import {
  createImageCarousel,
  createVideoCarousel,
} from "../controllers/CarouselController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import uploadVedioMiddleware from "../middleware/uploadVedioMiddleware.js";

const utilityRouter = express.Router();

utilityRouter.get("/logs", getAllLogs);
utilityRouter.post(
  "/add-image-carousel",
  uploadMiddleware.single("image"),
  createImageCarousel
);
utilityRouter.post(
  "/add-vedio-carousel",
  uploadVedioMiddleware.single("video"),
  createVideoCarousel
);
export default utilityRouter;
