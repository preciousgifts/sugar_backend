import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: [true, "Product ID is required"],
    },
    userId: {
      type: Number,
      required: [true, "User ID is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating value is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: false,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Compound index to ensure one rating per user per product
RatingSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Static method to calculate average rating for a product
RatingSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        productId: productId,
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        numberOfRatings: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  if (result.length > 0) {
    const distribution = result[0].ratingDistribution.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      numberOfRatings: result[0].numberOfRatings,
      distribution: distribution,
    };
  }

  return {
    averageRating: 0,
    numberOfRatings: 0,
    distribution: {},
  };
};

// Instance method to update product ratings after save
RatingSchema.post("save", async function () {
  const Rating = mongoose.model("Rating");
  await Rating.calculateAndUpdateProductRating(this.productId);
});

RatingSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    const Rating = mongoose.model("Rating");
    await Rating.calculateAndUpdateProductRating(doc.productId);
  }
});

RatingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const Rating = mongoose.model("Rating");
    await Rating.calculateAndUpdateProductRating(doc.productId);
  }
});

// Static method to update product with new rating data
RatingSchema.statics.calculateAndUpdateProductRating = async function (
  productId
) {
  const ratingStats = await this.calculateAverageRating(productId);

  // Use mongoose.model to avoid circular dependency
  const Product = mongoose.model("Product");
  await Product.findOneAndUpdate(
    { _id: productId },
    {
      ratings: ratingStats.averageRating.toString(),
      numberOfRatings: ratingStats.numberOfRatings.toString(),
      ratingDistribution: ratingStats.distribution,
    },
    { new: true }
  );
};

export default mongoose.model("Rating", RatingSchema);
