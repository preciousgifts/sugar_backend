import mongoose from "mongoose";
import dotenv from "dotenv";
import { Logger } from "../controllers/Logger.js";

dotenv.config();

const DbConnection = async () => {
  const url = process.env.MONGO_URL;
  // console.log(url);

  if (!url) {
    console.error(
      "MongoDB connection string is not defined in the dotenv file"
    );
    Logger.error(
      "MongoDB connection string is not defined in the dotenv file",
      { success: false, target: "DB Connection" },
      "utilitiesA"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(url);
    await Logger.info(
      "Database connected successfully",
      { success: true, target: "DB Connection" },
      "utilitiesA"
    );
  } catch (err) {
    await Logger.error(
      "MongoDB connection failed",
      { success: false, target: "DB Connection", error: err.message },
      "utilitiesA"
    );
    console.error("MongoDB connection failed", err);
    process.exit(1);
  }
};

export default DbConnection;
