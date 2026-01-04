import express from "express";
const router = express.Router();
import {
  getDashboard,
  getAllUsers,
  updateUser,
  getAllBookings,
  getBooking,
  updateBooking,
  deleteUser,
  getFlights,
  addFlight,
  updateFlight,
  deleteFlight,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/auth.js";

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get("/dashboard", getDashboard);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get("/users", getAllUsers);

// @route   PUT /api/admin/users/:id
// @desc    Update user role
// @access  Private/Admin
router.put("/users/:id", updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete("/users/:id", deleteUser);

// @route   GET /api/admin/bookings/:id
// @desc    Get single booking
// @access  Private/Admin
router.get("/bookings/:id", getBooking);

// @route   PUT /api/admin/bookings/:id
// @desc    Update booking status
// @access  Private/Admin
router.put("/bookings/:id", updateBooking);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete("/users/:id", deleteUser);

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private/Admin
router.get("/bookings", getAllBookings);

// @route   GET /api/admin/flights
// @desc    Get all flights
// @access  Private/Admin
router.get("/flights", getFlights);

// @route   POST /api/admin/flights
// @desc    Add new flight
// @access  Private/Admin
router.post("/flights", addFlight);

// @route   PUT /api/admin/flights/:id
// @desc    Update flight
// @access  Private/Admin
router.put("/flights/:id", updateFlight);

// @route   DELETE /api/admin/flights/:id
// @desc    Delete flight
// @access  Private/Admin
router.delete("/flights/:id", deleteFlight);

export default router;
