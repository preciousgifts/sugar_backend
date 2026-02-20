import jwt from "jsonwebtoken";
import { Logger } from "../controllers/Logger.js";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  //split the token from the array
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    Logger.error(
      "Access denied, no token provided, please login to continue",
      { success: false, target: "authentication" },
      "auth"
    );
    return res.status(401).json({
      success: false,
      message: "Access denied, no token provided, please login to continue",
    });
  }

  //decode the token

  try {
    const decodeTokenInfo = jwt.verify(token, process.env.SECRET_KEY);

    req.userInfo = decodeTokenInfo;
  } catch (err) {
    Logger.error(
      "Access denied. Please login to continue",
      { success: false, target: "authentication", error: err.message },
      "auth"
    );

    return res.status(500).json({
      success: false,
      message: "Access denied. Please login to continue",
    });
  }

  next();
};

export default authMiddleware;
