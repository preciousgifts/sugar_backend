import mongoose from "mongoose";
import Counter from "./Counter.js";

const carouselImageSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    imgUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
      enum: ["home page", "product page", "sub session", "home body"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      get: (v) =>
        new Date(v).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
    },
  },
  { toJSON: { getters: true }, toObject: { getters: true } }
);

carouselImageSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "carouselId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});

export const CarouselImageSchema = mongoose.model(
  "CarouselImageSchema",
  carouselImageSchema
);

const carouselVideoSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
    },
    vedioUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["home page", "product page", "sub session", "home body"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      get: (v) =>
        new Date(v).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }),
    },
  },
  { toJSON: { getters: true }, toObject: { getters: true } }
);

carouselVideoSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "carouselId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});
export const CarouselVideoSchema = mongoose.model(
  "CarouselVideoSchema",
  carouselVideoSchema
);
