import express from "express";
const router = express.Router();
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { protect, user, admin } from "../middleware/auth.js";

// Protected User Routes - Serve HTML Pages (JWT Protected)

// @route   GET /dashboard
// @desc    User dashboard page
// @access  Private (User)
router.get("/dashboard", protect, user, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard/user-dashboard.html"));
});

// @route   GET /my-bookings
// @desc    User bookings page
// @access  Private (User)
router.get("/my-bookings", protect, user, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard/my-bookings.html"));
});

// @route   GET /book-flight/:id
// @desc    Flight booking page
// @access  Private (User)
router.get("/book-flight/:id", protect, user, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard/book-flight.html"));
});

// @route   GET /profile
// @desc    User profile page
// @access  Private (User)
router.get("/profile", protect, user, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/dashboard/profile.html"));
});

// Protected Admin Routes - Serve HTML Pages (JWT + Role Protected)

// @route   GET /admin
// @desc    Admin dashboard page
// @access  Private (Admin)
router.get("/admin", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/admin-dashboard.html"));
});

// @route   GET /admin/flights
// @desc    Manage flights page
// @access  Private (Admin)
router.get("/admin/flights", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-flights.html"));
});

// @route   GET /admin/users
// @desc    Manage users page
// @access  Private (Admin)
router.get("/admin/users", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-users.html"));
});

// @route   GET /admin/bookings
// @desc    Manage bookings page
// @access  Private (Admin)
router.get("/admin/bookings", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-bookings.html"));
});

// @route   GET /admin/add-flight
// @desc    Add flight form page
// @access  Private (Admin)
router.get("/admin/add-flight", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/add-flight.html"));
});

// @route   GET /admin/reports
// @desc    Admin reports page
// @access  Private (Admin)
router.get("/admin/reports", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/reports.html"));
});

// @route   GET /admin/settings
// @desc    Admin settings page
// @access  Private (Admin)
router.get("/admin/settings", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/settings.html"));
});

// @route   GET /admin/umrah
// @desc    Manage Umrah packages page
// @access  Private (Admin)
router.get("/admin/umrah", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-umrah.html"));
});

// @route   GET /admin/offers
// @desc    Manage offers page
// @access  Private (Admin)
router.get("/admin/offers", protect, admin, (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin/manage-offers.html"));
});

export default router;
