import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";
import PackageOffer from "../models/PackageOffer.js";

// @desc    Get all available flights
// @route   GET /api/booking/flights
// @access  Public
const getFlights = async (req, res) => {
  try {
    const flights = await Flight.find({
      status: { $in: ["scheduled", "active"] },
      isArchived: { $ne: true },
    })
      .sort({ departureTime: 1 })
      .exec();

    const availableFlights = flights.filter((f) => f.availableSeats > 0);

    res.status(200).json({
      success: true,
      count: availableFlights.length,
      data: availableFlights,
    });
  } catch (error) {
    console.error("Get flights error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching flights",
    });
  }
};

// @desc    Search flights
// @route   GET /api/booking/flights/search
// @access  Public
// @desc    Search flights
// @route   GET /api/booking/flights/search
// @access  Public
const searchFlights = async (req, res) => {
  try {
    const { origin, destination, date, airline } = req.query;

    let flights = await Flight.search(
      origin,
      destination,
      date ? new Date(date) : null
    );

    // Filter by available seats
    flights = flights.filter((f) => f.availableSeats > 0);

    // Filter by airline if specified
    if (airline && airline.trim() !== "") {
      flights = flights.filter(
        (f) => f.airline.toLowerCase() === airline.toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights.map((f) => f.toJSON()),
    });
  } catch (error) {
    console.error("Search flights error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching flights",
    });
  }
};

// @desc    Create new booking
// @route   POST /api/booking/create
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { flightId, passengers, seatCount } = req.body;

    // Validate required fields
    if (!flightId || !passengers || !seatCount) {
      return res.status(400).json({
        success: false,
        message: "Flight ID, passengers, and seat count are required",
      });
    }

    // Validate that seat count matches number of passengers
    if (Array.isArray(passengers) && passengers.length !== seatCount) {
      return res.status(400).json({
        success: false,
        message: `Seat count (${seatCount}) must match number of passengers (${passengers.length})`,
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
      userId: req.user.id,
      flightId,
      passengerDetails: passengers,
      seatCount,
      totalPrice,
      status: "pending",
    });

    // Update flight available seats
    flight.availableSeats -= seatCount;
    await flight.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking.toJSON(),
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating booking",
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/booking/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking (unless admin)
    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking.toJSON(),
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching booking",
    });
  }
};

// @desc    Update booking
// @route   PUT /api/booking/:id
// @access  Private
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking (unless admin)
    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    // Only allow updating certain fields
    if (req.body.passengerDetails) {
      booking.passengerDetails = req.body.passengerDetails;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking.toJSON(),
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating booking",
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/booking/:id
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user owns this booking (unless admin)
    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Update flight available seats
    const flight = await Flight.findById(booking.flightId);
    if (flight) {
      flight.availableSeats += booking.seatCount;
      await flight.save();
    }

    // Update booking status to cancelled
    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while cancelling booking",
    });
  }
};

// @desc    Create package booking
// @route   POST /api/booking/package/create
// @access  Private
const createPackageBooking = async (req, res) => {
  try {
    const { packageOfferId, passengers, personCount } = req.body;

    // Validate required fields
    if (!packageOfferId || !passengers || !personCount) {
      return res.status(400).json({
        success: false,
        message: "Package offer ID, passengers, and person count are required",
      });
    }

    // Validate that person count matches number of passengers
    if (Array.isArray(passengers) && passengers.length !== personCount) {
      return res.status(400).json({
        success: false,
        message: `Person count (${personCount}) must match number of passengers (${passengers.length})`,
      });
    }

    // Check if package offer exists and is available
    const packageOffer = await PackageOffer.findById(packageOfferId);
    if (!packageOffer) {
      return res.status(404).json({
        success: false,
        message: "Package offer not found",
      });
    }

    // Check if offer is visible and bookable
    if (!packageOffer.isVisible || !packageOffer.isBookable) {
      return res.status(400).json({
        success: false,
        message: "This package is not available for booking",
      });
    }

    // Check if offer is still valid
    if (!packageOffer.isValid()) {
      return res.status(400).json({
        success: false,
        message: "This package offer has expired or is not yet available",
      });
    }

    // Check if there are available slots
    if (!packageOffer.hasAvailableSlots()) {
      return res.status(400).json({
        success: false,
        message: "No available slots for this package",
      });
    }

    // Calculate total price
    let totalPrice = packageOffer.price;
    if (packageOffer.priceUnit === "per person") {
      totalPrice = packageOffer.price * personCount;
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      bookingType: "package",
      packageOfferId,
      passengerDetails: passengers,
      personCount,
      totalPrice,
      status: "pending",
    });

    // Update package offer booking count
    packageOffer.currentBookings += 1;
    await packageOffer.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("packageOfferId", "name category price image")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "Package booking created successfully",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Create package booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating package booking",
      error: error.message,
    });
  }
};

// @desc    Get user's bookings (both flights and packages)
// @route   GET /api/booking/user/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user.id,
      isArchived: { $ne: true },
    })
      .populate(
        "flightId",
        "number origin destination departureTime arrivalTime"
      )
      .populate("packageOfferId", "name category price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings",
      error: error.message,
    });
  }
};

// @desc    Get user's archived/past bookings
// @route   GET /api/booking/user/past-bookings
// @access  Private
const getUserPastBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const bookings = await Booking.find({
      userId: req.user.id,
      isArchived: true,
    })
      .populate(
        "flightId",
        "number origin destination departureTime arrivalTime airline"
      )
      .populate("packageOfferId", "name category price image")
      .sort({ archivedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({
      userId: req.user.id,
      isArchived: true,
    });

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user past bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching past bookings",
      error: error.message,
    });
  }
};

export {
  getFlights,
  searchFlights,
  createBooking,
  createPackageBooking,
  getUserBookings,
  getUserPastBookings,
  getBooking,
  updateBooking,
  cancelBooking,
};
