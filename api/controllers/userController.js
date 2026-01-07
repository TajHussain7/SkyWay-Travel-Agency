import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import Feedback from "../models/Feedback.js";
import ContactQuery from "../models/ContactQuery.js";

// @desc    Get user dashboard
// @route   GET /api/user/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's bookings with populated flight details
    const userBookings = await Booking.find({ userId })
      .populate("flightId")
      .sort({ createdAt: -1 })
      .lean();

    const recentBookings = userBookings.slice(0, 5);

    // Get booking statistics
    const totalBookings = userBookings.length;
    const confirmedBookings = userBookings.filter(
      (b) => b.status === "confirmed"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
        },
        bookingStats: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: totalBookings - confirmedBookings,
        },
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching dashboard data",
    });
  }
};

// @desc    Book a flight
// @route   POST /api/user/book
// @access  Private
const bookFlight = async (req, res) => {
  try {
    const { flightId, seatCount, passengerDetails } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!flightId || !seatCount || !passengerDetails) {
      return res.status(400).json({
        success: false,
        message: "Flight ID, seat count, and passenger details are required",
      });
    }

    // Check if flight exists and has available seats
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    if (flight.availableSeats < seatCount) {
      return res.status(400).json({
        success: false,
        message: "Not enough available seats",
      });
    }

    // Calculate total price
    const totalPrice = flight.price * seatCount;

    // Create booking
    const booking = await Booking.create({
      userId,
      flightId,
      seatCount,
      totalPrice,
      passengerDetails,
    });

    // Update flight available seats
    flight.availableSeats -= seatCount;
    await flight.save();

    res.status(201).json({
      success: true,
      message: "Flight booked successfully",
      data: {
        booking: booking.toJSON(),
        flight: flight.toJSON(),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/user/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Booking.countDocuments({ userId });
    const bookings = await Booking.find({ userId })
      .populate("flightId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching bookings",
    });
  }
};

// @desc    Get single booking
// @route   GET /api/user/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("flightId")
      .lean();

    if (!booking || booking.userId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching booking",
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/user/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking || booking.userId.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();

    // Return seats to flight
    const flight = await Flight.findById(booking.flightId);
    if (flight) {
      flight.availableSeats += booking.seatCount;
      await flight.save();
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking: booking.toJSON(),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, address, passport, profileImage } =
      req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;
    if (passport !== undefined) user.passport = passport;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          passport: user.passport,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Change user password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Get user with password field
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user account (soft delete - archive)
// @route   DELETE /api/user/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password, feedback } = req.body;
    const userId = req.user.id;

    // Validate password is provided
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    // Get user with password field
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Calculate archive expiry (1 day from now)
    const archiveExpiresAt = new Date();
    archiveExpiresAt.setDate(archiveExpiresAt.getDate() + 1);

    // Archive the user account
    user.isArchived = true;
    user.archivedAt = new Date();
    user.archiveExpiresAt = archiveExpiresAt;
    user.archiveReason = "self_deleted";
    user.deletionFeedback = feedback || "";

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Account deleted successfully. You can recover it within 24 hours by contacting support.",
      data: {
        archivedAt: user.archivedAt,
        archiveExpiresAt: user.archiveExpiresAt,
      },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting account",
    });
  }
};

// @desc    Submit feedback after account deletion
// @route   POST /api/user/feedback
// @access  Public (for recently deleted users)
const submitFeedback = async (req, res) => {
  try {
    const { email, name, rating, message, type } = req.body;

    // Validate required fields
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: "Email and message are required",
      });
    }

    // Create feedback entry
    const feedback = await Feedback.create({
      userEmail: email,
      userName: name || "",
      rating: rating || 3,
      message,
      type: type || "account_deletion",
      status: "new",
    });

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      data: { feedback },
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error submitting feedback",
    });
  }
};

// @desc    Submit contact/support query
// @route   POST /api/contact
// @access  Public
const submitContactQuery = async (req, res) => {
  try {
    const { name, email, phone, subject, message, type } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required",
      });
    }

    // Determine priority based on type
    let priority = "medium";
    if (type === "account_recovery") {
      priority = "high";
    } else if (type === "complaint") {
      priority = "high";
    }

    // Create contact query
    const contactQuery = await ContactQuery.create({
      name,
      email,
      phone: phone || "",
      subject,
      message,
      type: type || "general",
      priority,
      status: "new",
    });

    res.status(201).json({
      success: true,
      message:
        "Your message has been sent successfully. We will get back to you soon!",
      data: { contactQuery },
    });
  } catch (error) {
    console.error("Submit contact query error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error submitting contact query",
    });
  }
};

export {
  getDashboard,
  getDashboard as getProfile,
  bookFlight,
  getBookings,
  getBookings as getUserBookings,
  getBooking,
  cancelBooking,
  updateProfile,
  changePassword,
  deleteAccount,
  submitFeedback,
  submitContactQuery,
};
