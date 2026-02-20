import { Log } from "../models/LogSchema.js";
import dotenv from "dotenv";
dotenv.config();

const LOGGING_ENABLED = process.env.LOGGING_ENABLED === "true";
const DB_LOGGING = process.env.DB_LOGGING === "true";
const timestamp = new Date(Date.now()).toLocaleString("en-NG", {
  timeZone: "Africa/Lagos",
});

const LOG_LEVELS = process.env.LOG_LEVELS
  ? process.env.LOG_LEVELS.split(",").map((l) => l.trim().toLowerCase())
  : [];

const LOG_MODULES = process.env.LOG_MODULES
  ? process.env.LOG_MODULES.split(",").map((m) => m.trim().toLowerCase())
  : [];

const Logger = {
  log: async (level, message, meta = {}, module = null) => {
    if (!LOGGING_ENABLED) return;

    if (!LOG_LEVELS.includes(level.toLowerCase())) return;

    if (
      LOG_MODULES.length > 0 &&
      module &&
      !LOG_MODULES.includes(module.toLowerCase())
    ) {
      return;
    }

    console.log(
      `${timestamp} [${level.toUpperCase()}] ${
        module ? `[${module}]` : ""
      } ${message}`,
      meta
    );
    if (DB_LOGGING) {
      await Log.create({ level, message, meta, module });
    }
  },

  info: (msg, meta, module) => Logger.log("info", msg, meta, module),
  warn: (msg, meta, module) => Logger.log("warn", msg, meta, module),
  error: (msg, meta, module) => Logger.log("error", msg, meta, module),
  // debug: (msg, meta, module) => Logger.log("debug", msg, meta, module),
};

const getAllLogs = async (req, res) => {
  try {
    const allLogs = await Log.find({});
    if (allLogs.length > 0) {
      Logger.info(
        "Logs fetched successfully",
        { success: true, target: "Logs" },
        "utilitiesA"
      );
      res.status(200).json({
        success: true,
        message: "Logs fetched successfully",
        data: allLogs,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Logs not found",
      });
    }
  } catch (err) {
    Logger.error(
      "Something went wrong while fetching logs",
      {
        success: false,
        target: "Logs",
        error: err.message,
      },
      "utilitiesA"
    );
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching Logs",
      error: err.message,
    });
  }
};
export { Logger, getAllLogs };
