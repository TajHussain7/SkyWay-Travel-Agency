import User from "../models/User.js";

/**
 * Middleware to check if user has admin role
 * Must be used after authentication middleware
 */
const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    // Check if user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // User is admin, proceed to next middleware
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during admin verification",
    });
  }
};

/**
 * Middleware to check if user is admin or the same user (for user profile operations)
 */
const requireAdminOrSelf = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    const targetUserId = req.params.userId || req.params.id;

    // Allow if user is admin OR if user is accessing their own data
    if (req.user.role === "admin" || req.user.id === targetUserId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own data.",
      });
    }
  } catch (error) {
    console.error("Admin or self check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authorization check",
    });
  }
};

/**
 * Check if current user is a super admin (for critical operations)
 * Super admin is defined as the default admin user
 */
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    // Check if user is the default admin
    if (req.user.email !== "admin@skyway.com" || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Super admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during super admin verification",
    });
  }
};

export { requireAdmin, requireAdminOrSelf, requireSuperAdmin };

// Export adminOnly as an alias for requireAdmin for backward compatibility
export const adminOnly = requireAdmin;
