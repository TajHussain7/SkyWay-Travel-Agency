import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserLayout from "../../components/UserLayout";
import PackageBookingModal from "../../components/PackageBookingModal";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    upcomingFlights: 0,
    totalSpent: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [availableFlights, setAvailableFlights] = useState([]);
  const [packageOffers, setPackageOffers] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
    loadPackageOffers();

    // Check if redirected from offers page with booking intent
    if (location.state?.bookingType === "package" && location.state?.offer) {
      setSelectedOffer(location.state.offer);
      setShowBookingModal(true);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const userData = response.data.user || response.data.data?.user;
      if (!userData) {
        navigate("/login");
      } else {
        setUser(userData);
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load user bookings
      const bookingsResponse = await axios.get("/api/user/bookings", {
        withCredentials: true,
      });
      const bookings = bookingsResponse.data.data?.bookings || [];

      // Calculate stats
      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(
        (b) => b.status === "confirmed"
      ).length;
      const upcomingFlights = bookings.filter((b) => {
        if (!b.flightId?.departureTime) return false;
        return new Date(b.flightId.departureTime) > new Date();
      }).length;
      const totalSpent = bookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );

      setStats({
        totalBookings,
        confirmedBookings,
        upcomingFlights,
        totalSpent,
      });

      // Get recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5));

      // Load available flights
      try {
        const flightsResponse = await axios.get("/api/booking/flights");
        const flights = flightsResponse.data.data || [];
        setAvailableFlights(flights.slice(0, 5));
      } catch (error) {
        console.log("Error loading flights:", error);
      }

      // Load package offers
      loadPackageOffers();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPackageOffers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/package-offers"
      );
      if (response.data.success) {
        // Show only 6 featured offers
        setPackageOffers(response.data.data.slice(0, 6));
      }
    } catch (error) {
      console.log("Error loading package offers:", error);
    }
  };

  const handleBookOffer = (offer) => {
    setSelectedOffer(offer);
    setShowBookingModal(true);
  };

  const searchFlights = () => {
    navigate("/flights");
  };

  const exploreUmrah = () => {
    navigate("/umrah");
  };

  const viewOffers = () => {
    navigate("/offers");
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back,{" "}
                <span className="text-yellow-300">{user?.name || "User"}</span>!
              </h1>
              <p className="text-gray-100 text-lg">
                Manage your flights and bookings
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={searchFlights}
              >
                <i className="fas fa-plus"></i> Book New Flight
              </button>
              <button
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={exploreUmrah}
              >
                <i className="fas fa-kaaba"></i> Hajj & Umrah
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                onClick={viewOffers}
              >
                <i className="fas fa-tags"></i> Special Offers
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4">
              <i className="fas fa-ticket-alt text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalBookings}
              </h3>
              <p className="text-gray-600">Total Bookings</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-4">
              <i className="fas fa-check-circle text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.confirmedBookings}
              </h3>
              <p className="text-gray-600">Confirmed</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4">
              <i className="fas fa-clock text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.upcomingFlights}
              </h3>
              <p className="text-gray-600">Upcoming Flights</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-4">
              <i className="fas fa-dollar-sign text-3xl"></i>
            </div>
            <div className="p-6">
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                ${stats.totalSpent.toLocaleString()}
              </h3>
              <p className="text-gray-600">Total Spent</p>
            </div>
          </div>
        </div>

        {/* Special Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Special Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={exploreUmrah}
            >
              <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6">
                <i className="fas fa-kaaba text-5xl mb-3"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Hajj & Umrah Packages
                </h3>
                <p className="text-gray-600 mb-4">
                  Explore our spiritual journey packages with complete guidance
                  and support.
                </p>
                <span className="text-primary font-semibold group-hover:text-primary-dark transition-colors duration-300">
                  <i className="fas fa-arrow-right"></i> Explore Packages
                </span>
              </div>
            </div>
            <div
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              onClick={viewOffers}
            >
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white p-6">
                <i className="fas fa-tags text-5xl mb-3"></i>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Special Offers
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover amazing deals and discounts on flights and travel
                  packages.
                </p>
                <span className="text-primary font-semibold group-hover:text-primary-dark transition-colors duration-300">
                  <i className="fas fa-arrow-right"></i> View Offers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Package Offers */}
        {packageOffers.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                <i className="fas fa-tags text-primary mr-2"></i>
                Featured Package Offers
              </h2>
              <button
                onClick={viewOffers}
                className="text-primary hover:text-primary-dark font-semibold transition-colors duration-300"
              >
                View All →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packageOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={offer.image}
                      alt={offer.name}
                      className="w-full h-full object-cover"
                    />
                    {offer.badge && (
                      <div
                        className={`absolute top-4 right-4 bg-gradient-to-r from-${offer.badgeColor}-400 to-${offer.badgeColor}-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}
                      >
                        {offer.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {offer.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {offer.description}
                    </p>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-success">
                          {offer.priceUnit === "percentage"
                            ? `${offer.price}% OFF`
                            : `$${offer.price.toLocaleString()}`}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          {offer.priceUnit}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleBookOffer(offer)}
                      className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-2 rounded-lg transition-all duration-300"
                    >
                      <i className="fas fa-calendar-check mr-2"></i>
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Bookings
            </h2>
            <a
              href="/my-bookings"
              className="text-primary hover:text-primary-dark font-semibold transition-colors duration-300"
            >
              View All →
            </a>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            {recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-ticket-alt text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start booking your first flight!
                </p>
                <button
                  className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-all duration-300"
                  onClick={searchFlights}
                >
                  <i className="fas fa-plus me-2"></i>Book Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors duration-300"
                  >
                    <div className="mb-2 md:mb-0">
                      <h4 className="font-bold text-gray-900 mb-1">
                        <i className="fas fa-plane text-primary me-2"></i>
                        {booking.flightId?.number || "N/A"} -{" "}
                        {booking.flightId?.origin || "N/A"} →{" "}
                        {booking.flightId?.destination || "N/A"}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        <i className="fas fa-calendar me-2"></i>
                        {booking.flightId?.departureTime
                          ? new Date(
                              booking.flightId.departureTime
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status || "pending"}
                      </span>
                      <span className="text-lg font-bold text-success">
                        ${(booking.totalPrice || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Flights */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Flights
            </h2>
            <a
              href="/flights"
              className="text-primary hover:text-primary-dark font-semibold transition-colors duration-300"
            >
              View All →
            </a>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            {availableFlights.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-plane text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No flights available
                </h3>
                <p className="text-gray-600">
                  Check back later for new flights
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableFlights.map((flight) => (
                  <div
                    key={flight._id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">
                        <i className="fas fa-plane-departure text-primary me-2"></i>
                        {flight.number || "N/A"}
                      </h4>
                      <span className="text-xl font-bold text-success">
                        ${flight.price || 0}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <i className="fas fa-map-marker-alt text-gray-400 me-2"></i>
                      {flight.origin || "N/A"} → {flight.destination || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedOffer && (
        <PackageBookingModal
          offer={selectedOffer}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedOffer(null);
          }}
          onSuccess={() => {
            loadDashboardData();
          }}
        />
      )}
    </UserLayout>
  );
};

export default Dashboard;
