import mongoose from "mongoose";
import Counter from "./Counter.js";

const ProductSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    currentPrice: {
      required: [true, "Product currentPrice is required"],
      type: Number,
    },
    originalPrice: {
      required: false,
      type: Number,
    },
    discount: {
      required: false,
      type: String,
    },
    ratings: {
      type: String,
      required: false,
    },
    numberOfRatings: {
      type: String,
      required: false,
    },
    ratingDistribution: {
      type: Map,
      of: Number,
      required: false,
      default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    colors: {
      type: [],
      required: false,
    },
    category: {
      required: [true, "Product category is required"],
      type: String,
      enum: ["general", "lips", "eyes", "face", "nails", "skin"],
      default: "general",
    },
    navratiSpecial: {
      type: Boolean,
      required: [true, "NavratiSpecial feature is required"],
    },
    sugarPop: {
      type: Boolean,
      required: [true, "Sugar Pop feature is required"],
    },
    sugarPlay: {
      type: Boolean,
      required: [true, "Sugar Play feature is required"],
    },
    gifting: {
      type: Boolean,
      required: [true, "NavratiSpecial feature is required"],
    },
    noOfSales: {
      type: Number,
      required: false,
    },
    totalQuantity: {
      type: Number,
      required: false,
    },
    imageUrl: {
      required: [true, "Image URL is required"],
      type: String,
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl2: {
      required: false,
      type: String,
      trim: true,
    },
    image2PublicId: {
      type: String,
      required: false,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: (v) =>
        new Date(v).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
    },

    updatedAt: {
      type: Date,
      default: Date.now,
      get: (v) =>
        new Date(v).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
    },
  },
  { toJSON: { getters: true }, toObject: { getters: true } }
);

//pre-saved hook to auto-increment ID
ProductSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "productId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});

export default mongoose.model("Product", ProductSchema);
