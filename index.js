import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import DbConnection from "./models/DbConnection.js";
import { Logger } from "./controllers/Logger.js";
import utilityRouter from "./routes/utilityRoutes.js";
import { productRoutes } from "./routes/productRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import ratingRoutes from "./routes/ratings.js";

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 4001;

app.use(cors());
app.use(express.json());
DbConnection();

//routers
app.use("/api/utilities", utilityRouter);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", ratingRoutes);
// app.use("/api/analytics", analyticsRoutes);

app.listen(port, () => {
  // console.log(`Server is now running on port ${port}`);
  Logger.info(
    `Server is now running on port ${port}`,
    { success: true, target: "server", message: "Your app is running" },
    "utilitiesA"
  );
});
