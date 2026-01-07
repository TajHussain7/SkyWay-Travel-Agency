import express from "express";
const router = express.Router();
import { submitContactQuery } from "../controllers/userController.js";

// @route   POST /api/contact
// @desc    Submit contact/support query
// @access  Public
router.post("/", submitContactQuery);

export default router;
