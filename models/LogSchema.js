import mongoose from "mongoose";
import Counter from "./Counter.js";

const logSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      default: "info",
    },
    message: {
      type: String,
      required: true,
    },
    meta: {
      type: Object,
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

logSchema.pre("save", async function (next) {
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
export const Log = mongoose.model("Log", logSchema);
