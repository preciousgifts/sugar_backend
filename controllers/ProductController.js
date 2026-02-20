import Product from "../models/ProductSchema.js";
import { Logger } from "./Logger.js";
import { uploadToCloudinary } from "../Helper/CloudinaryHelper.js";
import fs from "fs";

const createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      Logger.error(
        "At least one image is required",
        { success: false, target: "Product" },
        "product"
      );
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    // Upload all images
    const imageUploads = req.files.map((file) => uploadToCloudinary(file.path));
    const uploadedImages = await Promise.all(imageUploads);

    // Extract product details
    const {
      name,
      currentPrice,
      originalPrice,
      discount,
      totalQuantity,
      colors,
      category,
      subCategory,
      subSubCategory,
      navratiSpecial,
      sugarPop,
      sugarPlay,
      gifting,
    } = req.body;

    if (!name || !currentPrice || !category || uploadedImages.length === 0) {
      req.files.forEach((file) => fs.unlinkSync(file.path)); // cleanup
      Logger.error(
        "Kindly fill the required fields",
        { success: false, target: "Create Product Controller" },
        "products"
      );
      return res
        .status(400)
        .json({ success: false, message: "Kindly fill the required fields" });
    }

    // const colorsSplitted = req.body.colors ? JSON.parse(req.body.colors) : [];

    // Create product (use first two images if available)
    const newProduct = new Product({
      name,
      currentPrice,
      originalPrice,
      discount,
      colors,
      category,
      subCategory,
      subSubCategory,
      navratiSpecial,
      sugarPlay,
      sugarPop,
      gifting,
      totalQuantity,
      imageUrl: uploadedImages[0].url,
      imagePublicId: uploadedImages[0].public_id,
      ...(uploadedImages[1] && {
        imageUrl2: uploadedImages[1].url,
        image2PublicId: uploadedImages[1].public_id,
      }),
    });

    const savedProduct = await newProduct.save();

    // Cleanup tmp files
    req.files.forEach((file) => fs.unlinkSync(file.path));

    Logger.info(
      "Product created successfully",
      {
        success: true,
        target: "Create Product Controller",
        productID: newProduct._id,
      },
      "products"
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (err) {
    if (req.files) {
      req.files.forEach((file) => fs.unlinkSync(file.path));
    }
    Logger.error(
      "Something went wrong while creating product",
      { error: err.message, stack: err.stack },
      "products"
    );
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating product",
      error: err.message,
    });
  }
};

const getNewArrivalData = async (req, res) => {
  //where created data <= 10days
  try {
    const cutoffDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); //10*24*60*60*1000 - 10days
    const newArrivals = await Product.find({
      createdAt: { $gte: cutoffDate },
    });

    if (newArrivals.length > 0) {
      Logger.info(
        "New Products fetched successfully",
        { success: true, target: "products" },
        "utilitiesB"
      );
      res.status(200).json({
        success: true,
        message: "New product fetched successfully",
        data: newArrivals,
      });
    } else {
      Logger.warn(
        "No new product",
        { success: false, target: "product" },
        "utilitiesB"
      );
      res.status(404).json({
        success: false,
        message: "No new product",
      });
    }
  } catch (err) {
    Logger.error(
      "Something went wrong while fetching new products",
      { success: false, target: "product", error: err.message },
      "utilitiesB"
    );
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching new products",
      error: err.message,
    });
  }
};

const getNavratiSpecialData = async (req, res) => {
  // where
  try {
    const navratiSpecial = await Product.find({
      navratiSpecial: { $eq: true },
    });

    if (navratiSpecial.length > 0) {
      Logger.info(
        "NavratiSpecial products fetched successfully",
        { success: true, target: "product" },
        "utilitiesB"
      );
      res.status(200).json({
        success: true,
        message: "NavratiSpecial products fetched successfully",
        data: navratiSpecial,
      });
    } else {
      Logger.warn(
        "No NavratiSpecial product found",
        {
          success: false,
          target: "products",
        },
        "utilitiesB"
      );
      res.status(404).json({
        success: false,
        message: "No NavratiSpecial product found",
      });
    }
  } catch (err) {
    Logger.error(
      "Something went wrong while fetching NavratiSpecial products",
      { success: false, target: "product", error: err.message },
      "utilitiesB"
    );
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching NavratiSpecial products",
      error: err.message,
    });
  }
};

const getBestSellersData = async (req, res) => {
  //where number of sales = mode

  try {
    const bestSellerProduct = await Product.aggregate([
      { $sort: { noOfSales: -1 } }, //sort descending by noOfSales
      {
        $group: {
          _id: "subCategory",
          topProduct: { $first: "$$ROOT" }, //pick the first product per subcategory
        },
      },
    ]);
    if (bestSellerProduct.length > 0) {
      Logger.info(
        "bestSellerProduct products fetched successfully",
        { success: true, target: "product" },
        "utilitiesB"
      );
      return res.status(200).json({
        success: true,
        message: "bestSellerProduct products fetched successfully",
        data: bestSellerProduct,
      });
    } else {
      Logger.warn(
        "No bestSellerProduct product found",
        {
          success: false,
          target: "products",
        },
        "utililesB"
      );
      return res.status(404).json({
        success: false,
        message: "No bestSellerProduct product found",
      });
    }
  } catch (err) {
    Logger.error(
      "Something went wrong while fetching best seller products",
      {
        success: false,
        target: "product",
        error: err.message,
        details: err.stack,
      },
      "utilitiesB"
    );
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching best seller products",
      error: err.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({});
    if (allProducts.length > 0) {
      Logger.info(
        "Products fetched successfully",
        { success: true, target: "products" },
        "utilitiesB"
      );
      res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: allProducts,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Products not found",
      });
    }
  } catch (err) {
    Logger.error(
      "Something went wrong while fetching products",
      {
        success: false,
        target: "product",
        error: err.message,
      },
      "utilitiesB"
    );
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching products",
      error: err.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

export {
  createProduct,
  getBestSellersData,
  getNavratiSpecialData,
  getNewArrivalData,
  getAllProducts,
  getProductById,
};
