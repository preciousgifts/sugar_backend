import express from "express";
import {
  createProduct,
  getAllProducts,
  getBestSellersData,
  getNavratiSpecialData,
  getNewArrivalData,
  getProductById,
} from "../controllers/ProductController.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const productRoutes = express.Router();

productRoutes.post(
  "/create-product",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.array("images", 5),
  createProduct,
);
productRoutes.get("/new-arrivals", getNewArrivalData);
productRoutes.get("/navrati-special", getNavratiSpecialData);
productRoutes.get("/best-seller", getBestSellersData);
productRoutes.get(
  "/all-products",
  authMiddleware,
  adminMiddleware,
  getAllProducts,
);
productRoutes.get("/:id", authMiddleware, adminMiddleware, getProductById);

export { productRoutes };
