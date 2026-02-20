import { Logger } from "../controllers/Logger.js";

const adminMiddleware = (req, res, next) => {
  if (req.userInfo.role !== "admin") {
    Logger.error(
      "Access denied!. Admin right required.",
      { success: false, target: "authentication" },
      "auth"
    );

    return res.status(403).json({
      success: false,
      message: "Access denied! Admin right required",
    });
  }
  next();
};

export default adminMiddleware;
