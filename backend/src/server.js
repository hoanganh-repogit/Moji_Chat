import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import dns from "dns";
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/UserRoute.js";
import { protectRoute } from "./middlewares/authMiddleware.js";
import cors from "cors";

dns.setDefaultResultOrder("ipv4first");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Public routes
app.use("/api/auth", authRoute);
// Private routes
app.use(protectRoute);
app.use("/api/users", userRoute);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
