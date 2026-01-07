import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (one level up from api/)
const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });

// Debug: Verify .env loading
console.log("\n🔧 Environment Configuration:");
console.log(`   - Loading .env from: ${envPath}`);
console.log(`   - .env exists: ${fs.existsSync(envPath)}`);
console.log(`   - PORT: ${process.env.PORT || "NOT SET"}`);
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || "NOT SET"}`);
console.log(`   - MONGO_URI loaded: ${!!process.env.MONGO_URI}\n`);

import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

const app = express();

// Connect to Supabase Database
connectDB();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve static files from Vite build (in production)
// In development, React dev server runs separately on port 3000 or Vite dev server
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "dist")));
}

// Security headers & CORS
app.use((req, res, next) => {
  const allowed = [
    process.env.CLIENT_ORIGIN || "http://localhost:5173",
    "http://localhost:3000",
  ];
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Handle preflight
  if (req.method === "OPTIONS") return res.sendStatus(204);

  next();
});

// Routes (use api subfolder)
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import adminUmrahRoutes from "./routes/adminUmrah.js";
import adminOffersRoutes from "./routes/adminOffers.js";
import adminReportsRoutes from "./routes/adminReports.js";
import bookingRoutes from "./routes/booking.js";
import webRoutes from "./routes/web.js";
import protectedRoutes from "./routes/protected.js";
import packageOffersRoutes from "./routes/packageOffers.js";
import locationsRoutes from "./routes/locations.js";
import adminLocationsRoutes from "./routes/adminLocations.js";
import adminArchiveRoutes from "./routes/adminArchive.js";
import contactRoutes from "./routes/contact.js";
import errorHandler, { notFoundHandler } from "./middleware/error.js";

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/umrah", adminUmrahRoutes); // Public umrah routes
app.use("/api/admin/umrah", adminUmrahRoutes);
app.use("/api/admin/offers", adminOffersRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/admin/locations", adminLocationsRoutes);
app.use("/api/admin/archive", adminArchiveRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/package-offers", packageOffersRoutes);
app.use("/api/contact", contactRoutes);

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
  });
}

// 404 Not Found handler (before error handler)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
