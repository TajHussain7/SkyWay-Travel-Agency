/**
 * Password Utility Functions for SkyWay Travel Agency
 *
 * This module provides comprehensive password validation and security utilities
 */

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with status and messages
 */
const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    errors: [],
    suggestions: [],
  };

  // Check minimum length
  if (password.length < 8) {
    result.errors.push("Password must be at least 8 characters long");
  } else {
    result.score += 1;
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    result.errors.push(
      "Password must contain at least one uppercase letter (A-Z)"
    );
    result.suggestions.push("Add an uppercase letter");
  } else {
    result.score += 1;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    result.errors.push(
      "Password must contain at least one lowercase letter (a-z)"
    );
    result.suggestions.push("Add a lowercase letter");
  } else {
    result.score += 1;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    result.errors.push("Password must contain at least one number (0-9)");
    result.suggestions.push("Add a number");
  } else {
    result.score += 1;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.errors.push(
      "Password must contain at least one special character (!@#$%^&*...)"
    );
    result.suggestions.push("Add a special character like !@#$%^&*");
  } else {
    result.score += 1;
  }

  // Check for common weak patterns
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /^welcome/i,
  ];

  commonPatterns.forEach((pattern) => {
    if (pattern.test(password)) {
      result.errors.push("Password contains common weak patterns");
      result.suggestions.push("Avoid common words and sequences");
    }
  });

  // Determine overall validity
  result.isValid = result.errors.length === 0 && result.score >= 4;

  return result;
};

/**
 * Get password strength level
 * @param {string} password - The password to check
 * @returns {string} - Strength level (Weak, Fair, Good, Strong)
 */
const getPasswordStrength = (password) => {
  const validation = validatePassword(password);

  if (validation.score <= 1) return "Weak";
  if (validation.score <= 2) return "Fair";
  if (validation.score <= 3) return "Good";
  if (validation.score >= 4) return "Strong";

  return "Weak";
};

/**
 * Generate a strong password suggestion
 * @returns {string} - A strong password suggestion
 */
const generateStrongPassword = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let password = "";

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill remaining characters randomly
  const allChars = uppercase + lowercase + numbers + specialChars;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * Default admin user configuration
 */
const DEFAULT_ADMIN = {
  name: "Tajamal Hussain",
  email: "admin@skyway.com",
  password: "Admin@123", // Note: This should be changed after first login
  role: "admin",
};

/**
 * Password requirements for display to users
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  description: [
    "At least 8 characters long",
    "Contains uppercase letters (A-Z)",
    "Contains lowercase letters (a-z)",
    "Contains numbers (0-9)",
    "Contains special characters (!@#$%^&*...)",
    "Avoid common words and patterns",
  ],
};

export {
  validatePassword,
  getPasswordStrength,
  generateStrongPassword,
  DEFAULT_ADMIN,
  PASSWORD_REQUIREMENTS,
};
