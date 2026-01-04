import express from "express";
const router = express.Router();
import {
  getProfile,
  updateProfile,
  getUserBookings,
} from "../controllers/userController.js";
import { protect, user } from "../middleware/auth.js";

// Apply authentication middleware to all routes
router.use(protect);
router.use(user);

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", getProfile);

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", updateProfile);

// @route   GET /api/user/bookings
// @desc    Get user bookings
// @access  Private
router.get("/bookings", getUserBookings);

export default router;
