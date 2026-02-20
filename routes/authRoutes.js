import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const authRoutes = express.Router();

authRoutes.post("/sign-up", registerUser);
authRoutes.post("/login", loginUser, authMiddleware);

export { authRoutes };
