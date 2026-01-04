import express from "express";
const router = express.Router();
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public Routes - Serve HTML Pages

// @route   GET /
// @desc    Homepage
// @access  Public
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/home.html"));
});

// @route   GET /flights
// @desc    Flight list page
// @access  Public
router.get("/flights", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/flights.html"));
});

// @route   GET /about-us
// @desc    About us page
// @access  Public
router.get("/about-us", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/about-us.html"));
});

// @route   GET /contact-us
// @desc    Contact us page
// @access  Public
router.get("/contact-us", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/contact-us.html"));
});

// @route   GET /offers
// @desc    Offers page
// @access  Public
router.get("/offers", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/offers.html"));
});

// @route   GET /umrah
// @desc    Umrah page
// @access  Public
router.get("/umrah", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/umrah.html"));
});

// @route   GET /login
// @desc    Login form page
// @access  Public
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});

// @route   GET /register
// @desc    Registration form page
// @access  Public
router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/register.html"));
});

export default router;
