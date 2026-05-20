import jwt from "jsonwebtoken";
import User from "../models/User.js";

// authorize user by access token
export const protectRoute = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }
    // comfirm token
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          console.error(err);
          return res.status(403).json({ message: "Invalid access token" });
        }
        // find user
        const user = await User.findById(decodedUser.userId).select(
          "-hashedPassword",
        );
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
      },
    );
  } catch (error) {
    console.error("Error in auth middleware:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
