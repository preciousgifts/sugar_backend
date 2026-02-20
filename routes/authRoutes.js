import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authmiddleware.js";

const authRoutes = express.Router();

authRoutes.post("/sign-up", registerUser);
authRoutes.post("/login", loginUser);

export { authRoutes };
