import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/auth.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import UmrahPackage from "../models/UmrahPackage.js";
import Offer from "../models/Offer.js";

// @desc    Get comprehensive reports and analytics
// @route   GET /api/admin/reports
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    console.log("📊 Loading admin reports...");
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const startOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    console.log("📅 Date ranges:", {
      currentDate: currentDate.toISOString(),
      startOfMonth: startOfMonth.toISOString(),
      startOfLastMonth: startOfLastMonth.toISOString(),
      endOfLastMonth: endOfLastMonth.toISOString(),
    });

    // Get total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: startOfMonth },
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const newUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    console.log("👥 User stats:", {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersLastMonth,
    });

    // Get booking statistics
    const totalBookings = await Booking.countDocuments();
    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const lastMonthBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    console.log("🎫 Booking stats:", {
      totalBookings,
      monthlyBookings,
      lastMonthBookings,
    });

    // Calculate revenue
    const revenueAggregation = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyRevenueAgg = await Booking.aggregate([
      {
        $match: { createdAt: { $gte: startOfMonth } },
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    const lastMonthRevenueAgg = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: null,
          lastMonthRevenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;
    const monthlyRevenue = monthlyRevenueAgg[0]?.monthlyRevenue || 0;
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.lastMonthRevenue || 0;

    console.log("💰 Revenue stats:", {
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
    });

    // Calculate growth percentages
    const userGrowth =
      lastMonthBookings > 0
        ? (
            ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) *
            100
          ).toFixed(1)
        : 0;

    const bookingGrowth =
      lastMonthBookings > 0
        ? (
            ((monthlyBookings - lastMonthBookings) / lastMonthBookings) *
            100
          ).toFixed(1)
        : 0;

    const revenueGrowth =
      lastMonthRevenue > 0
        ? (
            ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) *
            100
          ).toFixed(1)
        : 0;

    // Get popular routes
    const popularRoutes = await Booking.aggregate([
      {
        $lookup: {
          from: "flights",
          localField: "flightId",
          foreignField: "_id",
          as: "flight",
        },
      },
      { $unwind: "$flight" },
      {
        $group: {
          _id: {
            from: "$flight.from",
            to: "$flight.to",
          },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
          avgPrice: { $avg: "$totalPrice" },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
    ]);

    // Get flight statistics
    const totalFlights = await Flight.countDocuments();
    const activeFlights = await Flight.countDocuments({
      status: "active",
      departureTime: { $gte: currentDate },
    });

    // Get Umrah/Hajj statistics
    const totalUmrahPackages = await UmrahPackage.countDocuments();
    const activeUmrahPackages = await UmrahPackage.countDocuments({
      status: "active",
    });

    // Get offers statistics
    const totalOffers = await Offer.countDocuments();
    const activeOffers = await Offer.countDocuments({
      status: "active",
      validTo: { $gte: currentDate },
    });

    // Calculate average rating (mock data for now)
    const avgRating = 4.7 + Math.random() * 0.2; // 4.7-4.9 range

    const reportData = {
      overview: {
        totalRevenue,
        monthlyRevenue,
        revenueGrowth: parseFloat(revenueGrowth),
        totalBookings,
        monthlyBookings,
        bookingGrowth: parseFloat(bookingGrowth),
        totalUsers,
        activeUsers,
        userGrowth: parseFloat(userGrowth),
        avgRating: parseFloat(avgRating.toFixed(1)),
      },
      popularRoutes: popularRoutes.map((route) => ({
        route: `${route._id.from} → ${route._id.to}`,
        bookings: route.bookings,
        revenue: route.revenue,
        avgPrice: route.avgPrice,
        growth: Math.random() * 30 - 5, // Random growth between -5% and 25%
      })),
      services: {
        flights: { total: totalFlights, active: activeFlights },
        umrahPackages: {
          total: totalUmrahPackages,
          active: activeUmrahPackages,
        },
        offers: { total: totalOffers, active: activeOffers },
      },
      customers: {
        newThisMonth: newUsersThisMonth,
        returningCustomers: activeUsers - newUsersThisMonth,
      },
    };

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports data",
    });
  }
});

// @desc    Get revenue trend data for charts
// @route   GET /api/admin/reports/revenue-trends
// @access  Private/Admin
router.get("/revenue-trends", protect, admin, async (req, res) => {
  try {
    console.log("📈 Loading revenue trends...");
    const { period = "6months" } = req.query;
    console.log("📊 Period requested:", period);

    const currentDate = new Date();
    let startDate;
    let groupFormat;
    let periods = [];

    // Determine date range and grouping based on period
    switch (period) {
      case "1year":
        startDate = new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          1
        );
        groupFormat = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        // Generate 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          periods.push(date.toISOString().substring(0, 7));
        }
        break;
      case "2years":
        startDate = new Date(
          currentDate.getFullYear() - 2,
          currentDate.getMonth(),
          1
        );
        groupFormat = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        // Generate 24 months
        for (let i = 23; i >= 0; i--) {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          periods.push(date.toISOString().substring(0, 7));
        }
        break;
      default: // 6months
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 5,
          1
        );
        groupFormat = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        // Generate 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );
          periods.push(date.toISOString().substring(0, 7));
        }
    }

    console.log("📅 Chart date range:", {
      startDate: startDate.toISOString(),
      periods: periods,
    });

    // Get revenue data grouped by period
    const revenueData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("📊 Raw revenue data from DB:", revenueData);

    // Create a map for easier lookup
    const revenueMap = {};
    revenueData.forEach((item) => {
      revenueMap[item._id] = {
        revenue: item.revenue,
        bookings: item.bookings,
      };
    });

    // Generate complete dataset with all periods
    const chartData = periods.map((period) => {
      const data = revenueMap[period] || { revenue: 0, bookings: 0 };
      const date = new Date(period + "-01");
      return {
        period,
        label: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        revenue: data.revenue,
        bookings: data.bookings,
      };
    });

    console.log("📊 Final chart data:", {
      totalPeriods: chartData.length,
      sampleData: chartData.slice(0, 2),
    });

    res.json({
      success: true,
      data: {
        chartData,
        totalRevenue: chartData.reduce((sum, item) => sum + item.revenue, 0),
        totalBookings: chartData.reduce((sum, item) => sum + item.bookings, 0),
        period,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue trends:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching revenue trends",
    });
  }
});

// Development helper route to create sample data
if (process.env.NODE_ENV !== "production") {
  router.get("/create-sample-data", protect, admin, async (req, res) => {
    try {
      console.log("🔄 Creating sample data for development...");

      // Check if we already have bookings
      const existingBookings = await Booking.countDocuments();
      if (existingBookings > 0) {
        return res.json({
          success: true,
          message: "Sample data already exists",
          bookingCount: existingBookings,
        });
      }

      // Get all users and flights to create sample bookings
      const users = await User.find().limit(5);
      const flights = await Flight.find().limit(5);

      if (users.length === 0 || flights.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Need users and flights to create sample bookings",
        });
      }

      const sampleBookings = [];
      const now = new Date();

      // Create bookings over the last 6 months
      for (let i = 0; i < 20; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomFlight =
          flights[Math.floor(Math.random() * flights.length)];

        // Random date in the last 6 months
        const monthsAgo = Math.floor(Math.random() * 6);
        const daysAgo = Math.floor(Math.random() * 30);
        const bookingDate = new Date(now);
        bookingDate.setMonth(bookingDate.getMonth() - monthsAgo);
        bookingDate.setDate(bookingDate.getDate() - daysAgo);

        const seatCount = Math.floor(Math.random() * 3) + 1;
        const basePrice = Math.floor(Math.random() * 500) + 200;
        const totalPrice = basePrice * seatCount;

        sampleBookings.push({
          userId: randomUser._id,
          flightId: randomFlight._id,
          seatCount: seatCount,
          totalPrice: totalPrice,
          bookingDate: bookingDate,
          createdAt: bookingDate,
          status: "confirmed",
          passengerDetails: Array.from({ length: seatCount }, (_, idx) => ({
            name: `Passenger ${i}-${idx}`,
            age: Math.floor(Math.random() * 50) + 20,
            gender: ["male", "female"][Math.floor(Math.random() * 2)],
          })),
        });
      }

      const createdBookings = await Booking.insertMany(sampleBookings);
      console.log("✅ Created sample bookings:", createdBookings.length);

      res.json({
        success: true,
        message: "Sample data created successfully",
        bookingCount: createdBookings.length,
      });
    } catch (error) {
      console.error("Error creating sample data:", error);
      res.status(500).json({
        success: false,
        message: "Error creating sample data",
      });
    }
  });
}

export default router;
