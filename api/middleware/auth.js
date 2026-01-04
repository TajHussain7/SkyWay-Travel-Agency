import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies first, then headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

// Admin role check
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Not authorized as an admin",
    });
  }
};

// User role check (user or admin)
const user = (req, res, next) => {
  if (req.user && (req.user.role === "user" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Not authorized, user access required",
    });
  }
};

export { protect, admin, user };
