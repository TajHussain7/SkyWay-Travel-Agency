import { getConnectionStatus } from "../config/db.js";

/**
 * Global error handling middleware
 * Catches and formats all errors in a user-friendly way
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details for debugging
  console.error("\n❌ ERROR OCCURRED:");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error(`Path: ${req.method} ${req.originalUrl}`);
  console.error(`Error Name: ${err.name}`);
  console.error(`Error Code: ${err.code}`);
  console.error(`Message: ${err.message}`);
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  let statusCode = error.statusCode || 500;
  let userMessage = error.message || "An unexpected error occurred";

  // Database Connection Errors
  if (
    err.code === "ECONNREFUSED" ||
    err.code === "ENOTFOUND" ||
    err.message?.includes("connection")
  ) {
    statusCode = 503;
    userMessage =
      "Database connection failed. Please try again later or contact support.";
    error.type = "DATABASE_CONNECTION_ERROR";
  }

  // MongoDB errors
  if (err.name === "MongoError" || err.name === "MongoServerError") {
    statusCode = 500;
    userMessage = "Database operation failed. Please try again.";
    error.type = "DATABASE_ERROR";
  }

  // Timeout Errors
  if (err.code === "ETIMEDOUT" || err.message?.includes("timeout")) {
    statusCode = 408;
    userMessage =
      "Request timed out. Please check your connection and try again.";
    error.type = "REQUEST_TIMEOUT";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    userMessage = "Invalid or malformed token. Please log in again.";
    error.type = "AUTHENTICATION_ERROR";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    userMessage = "Your session has expired. Please log in again.";
    error.type = "TOKEN_EXPIRED";
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    userMessage = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error.type = "VALIDATION_ERROR";
  }

  // Mongoose Cast Error (invalid ID format)
  if (err.name === "CastError") {
    statusCode = 400;
    userMessage = `Invalid ${err.path}: ${err.value}`;
    error.type = "INVALID_DATA";
  }

  // Duplicate entry errors (MongoDB duplicate key)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    userMessage = `This ${field} already exists. Please use a different ${field}.`;
    error.type = "DUPLICATE_ENTRY";
  }

  // Not found errors
  if (err.name === "NotFoundError" || statusCode === 404) {
    userMessage = "The requested resource was not found.";
    error.type = "NOT_FOUND";
  }

  // Get database status to include in response
  const dbStatus = getConnectionStatus();

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: userMessage,
    errorCode: error.code,
    errorType: error.type || "UNKNOWN_ERROR",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && {
      debug: {
        originalError: err.message,
        stack: err.stack?.split("\n").slice(0, 3),
        dbStatus: dbStatus.connected ? "connected" : "disconnected",
        dbState: dbStatus.state,
      },
    }),
  });
};

/**
 * 404 Not Found handler
 * Should be placed after all routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    errorType: "NOT_FOUND",
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;
export { notFoundHandler };
