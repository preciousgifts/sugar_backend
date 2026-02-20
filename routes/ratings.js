import express from "express";
const router = express.Router();
import {
  submitRating,
  getProductRatings,
  getMyRating,
  updateRating,
  deleteRating,
} from "../controllers/ratingsController.js";
import authMiddleware from "../middleware/authmiddleware.js";

// Public routes
router.get("/products/:productId/ratings", getProductRatings);

// Protected routes (require authentication)
router.post("/ratings", authMiddleware, submitRating);
router.get("/products/:productId/my-rating", authMiddleware, getMyRating);
router.put("/ratings/:ratingId", authMiddleware, updateRating);
router.delete("/ratings/:ratingId", authMiddleware, deleteRating);

export default router;
