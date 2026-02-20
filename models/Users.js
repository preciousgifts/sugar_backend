import mongoose from "mongoose";
import Counter from "./Counter.js";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "First Name is required"],
    },
    middleName: {
      type: String,
      trim: true,
      required: false,
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "First Name is required"],
    },
    username: {
      type: String,
      trim: true,
      required: [true, "First Name is required"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "email is required "],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      required: [true, "role is required"],
      enum: ["user", "admin"],
      default: "user",
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

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "userId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this._id = counter.seq;
  }
  next();
});

export default mongoose.model("User", userSchema);
