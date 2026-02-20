import mongoose from "mongoose";
import Counter from "./Counter.js";

const navBarCarouselVedio = new mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    vedioUrl: {
      type: String,
      required: true,
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

navBarCarouselVedio.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "logId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});
export const NavBarCarouselVedioSchema = mongoose.model(
  "NavBarCarouselVedioSchema",
  navBarCarouselVedio
);
