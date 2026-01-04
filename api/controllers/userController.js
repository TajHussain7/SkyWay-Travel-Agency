import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";

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
    const { name, email } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
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

export {
  getDashboard,
  getDashboard as getProfile,
  bookFlight,
  getBookings,
  getBookings as getUserBookings,
  getBooking,
  cancelBooking,
  updateProfile,
};
