import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30s";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days in seconds

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({ message: "Username already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds of salt

    // Create new user in database
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });
    // Return success response
    res.status(204).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during sign up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  try {
    // Itake inputs
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }
    // normalize username (stored as lowercase in DB) and take hashed password from database
    const lookupUsername = username.toString().trim().toLowerCase();
    const user = await User.findOne({ username: lookupUsername });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // check password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password or username" });
    }
    // If match username, check password, create access token and refresh token
    const accesstoken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    // create refresh token and return to client
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // create session for user save token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // return refresh token to cookies
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // backend and frontend are on different domains, so we need to set sameSite to "none"
      maxAge: REFRESH_TOKEN_TTL,
    });

    // return access token to client
    return res.status(200).json({
      message: `User ${user.displayName} logged in successfully`,
      accessToken: accesstoken,
    });
  } catch (error) {
    console.error("Error during sign in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signOut = async (req, res) => {
  try {
    // take refresh token from cookies
    const token = req.cookies?.refreshToken;
    if (token) {
      // remove refresh token from database
      await Session.deleteOne({ refreshToken: token });
      // remove cookie
      res.clearCookie("refreshToken");
    }

    return res.status(204).json({ message: "User signed out successfully" });
  } catch (error) {
    console.error("Error during sign out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// create new access token when refresh token is valid
export const refreshToken = async (req, res) => {
  try {
    // take refresh token from cookies
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // check if token exists
    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    // find session with refresh token
    if (session.expiresAt < new Date()) {
      // remove expired session
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // create new access token and return to client
    const accessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // return new access token to client
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error during token refresh:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
