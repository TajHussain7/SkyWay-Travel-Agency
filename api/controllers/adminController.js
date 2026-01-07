import User from "../models/User.js";
import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";

// @desc    Get admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboard = async (req, res) => {
  try {
    // Get statistics from MongoDB
    const users = await User.find({});
    const flights = await Flight.find({});
    const bookings = await Booking.find({});

    const totalUsers = users.filter((u) => u.role === "user").length;
    const totalFlights = flights.length;
    const totalBookings = bookings.length;

    // Calculate revenue
    let totalRevenue = 0;
    bookings.forEach((b) => {
      if (b.status === "confirmed") {
        totalRevenue += b.totalPrice || 0;
      }
    });

    // Get recent bookings with populated user and flight data
    const recentBookings = await Booking.find({})
      .populate("userId", "name email phone profileImage")
      .populate("flightId")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();

    // Get recent users
    const recentUsers = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email profileImage createdAt")
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalFlights,
          totalBookings,
          totalRevenue,
        },
        recentBookings,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await User.countDocuments({ role: "user" });

    // Get users with pagination
    const users = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password")
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin user",
      });
    }

    // Delete user from MongoDB
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all flights
// @route   GET /api/admin/flights
// @access  Private/Admin
const getFlights = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Flight.countDocuments();

    // Get flights with pagination
    const flights = await Flight.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: flights,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create flight
// @route   POST /api/admin/flights
// @access  Private/Admin
const createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);

    res.status(201).json({
      success: true,
      message: "Flight created successfully",
      data: {
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

// @desc    Update flight
// @route   PUT /api/admin/flights/:id
// @access  Private/Admin
const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    // Update flight properties
    Object.assign(flight, req.body);
    await flight.save();

    res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      data: {
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

// @desc    Delete flight
// @route   DELETE /api/admin/flights/:id
// @access  Private/Admin
const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: "Flight not found",
      });
    }

    // Check if flight has bookings
    const bookings = await Booking.find({ flightId: req.params.id });
    const activeBookings = bookings.filter((b) =>
      ["confirmed", "pending"].includes(b.status)
    );

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete flight with active bookings",
      });
    }

    // Delete flight from MongoDB
    await Flight.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Flight deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Booking.countDocuments();

    // Get bookings with pagination and populate user and flight info
    const bookings = await Booking.find({})
      .populate("userId", "name email phone profileImage")
      .populate("flightId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
const updateBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
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

// @desc    Get single booking
// @route   GET /api/admin/bookings/:id
// @access  Private/Admin
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
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

export {
  getDashboard,
  getUsers as getAllUsers,
  updateUser,
  deleteUser,
  getFlights,
  createFlight as addFlight,
  updateFlight,
  deleteFlight,
  getBookings as getAllBookings,
  getBooking,
  updateBooking,
};
