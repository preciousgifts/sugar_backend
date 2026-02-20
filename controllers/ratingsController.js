import Rating from "../models/Ratings.js";
import Product from "../models/ProductSchema.js";

// @desc    Submit a rating for a product
// @route   POST /api/ratings
// @access  Private
const submitRating = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.userInfo.userId; // From auth middleware

    // Validate input
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Product ID and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if product exists
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user has already rated this product
    const existingRating = await Rating.findOne({
      productId: productId,
      userId: userId,
    });

    let ratingDoc;

    if (existingRating) {
      // Update existing rating
      ratingDoc = await Rating.findOneAndUpdate(
        { productId: productId, userId: userId },
        {
          rating: rating,
          comment: comment || existingRating.comment,
          isActive: true,
        },
        { new: true, runValidators: true }
      ).populate("userId", "name email");
    } else {
      // Create new rating
      ratingDoc = await Rating.create({
        productId: productId,
        userId: userId,
        rating: rating,
        comment: comment,
      });

      ratingDoc = await ratingDoc.populate("userId", "name email");
    }

    res.status(200).json({
      success: true,
      message: existingRating
        ? "Rating updated successfully"
        : "Rating submitted successfully",
      data: ratingDoc,
    });
  } catch (error) {
    console.error("Rating submission error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this product",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error submitting rating",
      error: error.message,
      details: error.stack,
    });
  }
};

// @desc    Get ratings for a product
// @route   GET /api/products/:productId/ratings
// @access  Public
const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if product exists
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get ratings with pagination
    const ratings = await Rating.find({
      productId: productId,
      isActive: true,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalRatings = await Rating.countDocuments({
      productId: productId,
      isActive: true,
    });

    // Get rating statistics
    const ratingStats = await Rating.aggregate([
      {
        $match: {
          productId: parseInt(productId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          ratingBreakdown: {
            $push: "$rating",
          },
        },
      },
    ]);

    const stats =
      ratingStats.length > 0
        ? {
            averageRating: Math.round(ratingStats[0].averageRating * 10) / 10,
            totalRatings: ratingStats[0].totalRatings,
            breakdown: ratingStats[0].ratingBreakdown.reduce(
              (acc, rating) => {
                acc[rating] = (acc[rating] || 0) + 1;
                return acc;
              },
              { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            ),
          }
        : {
            averageRating: 0,
            totalRatings: 0,
            breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };

    res.status(200).json({
      success: true,
      message: "Ratings fetched successfully",
      data: {
        ratings,
        pagination: {
          current: page,
          pages: Math.ceil(totalRatings / limit),
          total: totalRatings,
        },
        statistics: stats,
      },
    });
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ratings",
      error: error.message,
    });
  }
};

// @desc    Get user's rating for a specific product
// @route   GET /api/products/:productId/my-rating
// @access  Private
const getMyRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userInfo.userId;

    const rating = await Rating.findOne({
      productId: productId,
      userId: userId,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      message: "User rating fetched successfully",
      data: rating || null,
    });
  } catch (error) {
    console.error("Get user rating error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user rating",
      error: error.message,
    });
  }
};

// @desc    Update a rating
// @route   PUT /api/ratings/:ratingId
// @access  Private
const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userInfo.userId;

    const ratingDoc = await Rating.findOne({
      _id: ratingId,
      userId: userId,
    });

    if (!ratingDoc) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      {
        rating: rating || ratingDoc.rating,
        comment: comment !== undefined ? comment : ratingDoc.comment,
      },
      { new: true, runValidators: true }
    ).populate("userId", "name email");

    res.status(200).json({
      success: true,
      message: "Rating updated successfully",
      data: updatedRating,
    });
  } catch (error) {
    console.error("Update rating error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating rating",
      error: error.message,
    });
  }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:ratingId
// @access  Private
const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.userInfo.userId;

    const rating = await Rating.findOne({
      _id: ratingId,
      userId: userId,
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    // Soft delete by setting isActive to false
    await Rating.findByIdAndUpdate(ratingId, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.error("Delete rating error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting rating",
      error: error.message,
    });
  }
};

export {
  submitRating,
  getProductRatings,
  getMyRating,
  updateRating,
  deleteRating,
};
