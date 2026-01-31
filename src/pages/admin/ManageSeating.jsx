import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import ConfirmModal from "../../components/ConfirmModal";

const ManageSeating = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [seatMap, setSeatMap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [stats, setStats] = useState({
    totalSeats: 0,
    bookedSeats: 0,
    availableSeats: 0,
    occupancyRate: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    loadFlights();
  }, []);

  useEffect(() => {
    if (selectedFlight) {
      loadFlightBookings(selectedFlight._id);
      generateSeatMap();
    }
  }, [selectedFlight]);

  // Regenerate seat map and stats whenever bookings change
  useEffect(() => {
    if (selectedFlight) {
      generateSeatMap();
      calculateStats();
    }
  }, [bookings]);

  // Auto-refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (selectedFlight) {
        loadFlightBookings(selectedFlight._id);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [selectedFlight]);

  const checkAdminAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const userData = response.data.user || response.data.data?.user;
      if (!userData || userData.role !== "admin") {
        navigate("/dashboard");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const loadFlights = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/flights", {
        withCredentials: true,
      });
      const flightsData =
        response.data.data?.flights ||
        response.data.flights ||
        response.data.data ||
        [];
      setFlights(flightsData);
    } catch (error) {
      console.error("Error loading flights:", error);
      showNotification("error", "Failed to load flights");
    } finally {
      setLoading(false);
    }
  };

  const loadFlightBookings = async (flightId) => {
    try {
      const response = await axios.get(
        `/api/admin/bookings?flightId=${flightId}`,
        {
          withCredentials: true,
        }
      );
      const bookingsData = response.data.data || [];
      // Filter for this flight and only confirmed/pending bookings (not cancelled)
      const relevantBookings = bookingsData.filter(
        (b) =>
          b.flightId?._id === flightId &&
          (b.status === "confirmed" || b.status === "pending")
      );
      setBookings(relevantBookings);
      calculateStats();
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const generateSeatMap = () => {
    if (!selectedFlight) return;

    const rows = Math.ceil(selectedFlight.totalSeats / 6); // 6 seats per row (A-F)
    const seatLayout = [];

    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < 6; col++) {
        const seatNumber = `${row}${String.fromCharCode(65 + col)}`;
        const seatIndex = (row - 1) * 6 + col + 1;

        if (seatIndex <= selectedFlight.totalSeats) {
          rowSeats.push({
            number: seatNumber,
            index: seatIndex,
            status: "available",
            booking: null,
          });
        }
      }
      seatLayout.push(rowSeats);
    }

    // Mark booked seats
    bookings.forEach((booking) => {
      if (booking.seatNumbers && Array.isArray(booking.seatNumbers)) {
        booking.seatNumbers.forEach((seatNum) => {
          const row = parseInt(seatNum.match(/\d+/)[0]);
          const colChar = seatNum.match(/[A-F]/)[0];
          const col = colChar.charCodeAt(0) - 65;

          if (seatLayout[row - 1] && seatLayout[row - 1][col]) {
            seatLayout[row - 1][col].status = "booked";
            seatLayout[row - 1][col].booking = booking;
          }
        });
      }
    });

    setSeatMap(seatLayout);
  };

  const calculateStats = () => {
    if (!selectedFlight) return;

    const totalSeats = selectedFlight.totalSeats;

    // Calculate booked seats from actual active bookings, not from flight.availableSeats
    const bookedSeats = bookings.reduce((total, booking) => {
      return total + (booking.seatCount || 0);
    }, 0);

    const availableSeats = totalSeats - bookedSeats;
    const occupancyRate =
      totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : 0;

    setStats({
      totalSeats,
      bookedSeats,
      availableSeats,
      occupancyRate,
    });
  };

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    setSeatMap([]);
    setBookings([]);
  };

  const getSeatClass = (seat) => {
    const baseClass =
      "relative w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-semibold transition-all cursor-pointer";

    if (seat.status === "booked") {
      return `${baseClass} bg-red-500 border-red-600 text-white hover:bg-red-600`;
    }
    return `${baseClass} bg-green-500 border-green-600 text-white hover:bg-green-600`;
  };

  const handleSeatClick = (seat) => {
    // Click functionality disabled - use hover instead
  };

  const handleSeatHover = (seat, isEntering) => {
    if (isEntering && seat.booking) {
      setHoveredSeat(seat);
    } else if (!isEntering) {
      setHoveredSeat(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredFlights = flights.filter(
    (flight) =>
      flight.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <i className="fas fa-spinner fa-spin text-5xl text-primary"></i>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <i className="fas fa-chair"></i>
                Seating Management
              </h1>
              <p className="mt-2 text-white/90">
                Manage flight seating and view seat availability
              </p>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`p-4 rounded-lg ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : notification.type === "error"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flight Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Select Flight
              </h2>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search flights..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
              </div>

              {/* Flights List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredFlights.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No flights found
                  </p>
                ) : (
                  filteredFlights.map((flight) => (
                    <div
                      key={flight._id}
                      onClick={() => handleFlightSelect(flight)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedFlight?._id === flight._id
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {flight.number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {flight.airline}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            flight.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : flight.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {flight.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {flight.origin} → {flight.destination}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          <i className="fas fa-chair mr-1"></i>
                          {flight.availableSeats}/{flight.totalSeats} available
                        </span>
                        <span>
                          {(
                            ((flight.totalSeats - flight.availableSeats) /
                              flight.totalSeats) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Seat Map Panel */}
          <div className="lg:col-span-2">
            {!selectedFlight ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <i className="fas fa-hand-pointer text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a Flight
                </h3>
                <p className="text-gray-500">
                  Choose a flight from the list to view its seat map
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Header with Refresh Button */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    <i className="fas fa-chair mr-2 text-primary"></i>
                    {selectedFlight.number} - Seat Map
                  </h2>
                  <button
                    onClick={() => loadFlightBookings(selectedFlight._id)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <i className="fas fa-sync-alt"></i>
                    Refresh Seats
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">
                      Total Seats
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.totalSeats}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">
                      Available
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.availableSeats}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Booked</p>
                    <p className="text-2xl font-bold text-red-900">
                      {stats.bookedSeats}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">
                      Occupancy
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {stats.occupancyRate}%
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 mb-6 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 border-2 border-green-600 rounded"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 border-2 border-red-600 rounded"></div>
                    <span className="text-sm text-gray-600">Booked</span>
                  </div>
                </div>

                {/* Seat Map */}
                <div className="bg-gray-50 p-6 rounded-lg overflow-auto">
                  <div className="flex flex-col items-center space-y-2">
                    {seatMap.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-2">
                        {row.slice(0, 3).map((seat, seatIndex) => (
                          <div key={seatIndex} className="relative">
                            <button
                              onClick={() => handleSeatClick(seat)}
                              onMouseEnter={() => handleSeatHover(seat, true)}
                              onMouseLeave={() => handleSeatHover(seat, false)}
                              className={getSeatClass(seat)}
                              title={`Seat ${seat.number} - ${seat.status}`}
                            >
                              {seat.number}
                            </button>
                            {hoveredSeat?.number === seat.number &&
                              seat.booking && (
                                <div
                                  className={`absolute z-50 ${
                                    seat.number.startsWith("1")
                                      ? "top-full mt-2"
                                      : "bottom-full mb-2"
                                  } left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none`}
                                >
                                  <div className="font-semibold">
                                    {seat.booking.userId?.name || "Unknown"}
                                  </div>
                                  <div className="text-gray-300">
                                    {seat.booking.bookingReference ||
                                      seat.booking.ticketNumber ||
                                      "No ticket #"}
                                  </div>
                                  {seat.number.startsWith("1") ? (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                                      <div className="border-4 border-transparent border-b-gray-900"></div>
                                    </div>
                                  ) : (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                      <div className="border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                        {/* Aisle */}
                        <div className="w-6"></div>
                        {row.slice(3, 6).map((seat, seatIndex) => (
                          <div key={seatIndex + 3} className="relative">
                            <button
                              onClick={() => handleSeatClick(seat)}
                              onMouseEnter={() => handleSeatHover(seat, true)}
                              onMouseLeave={() => handleSeatHover(seat, false)}
                              className={getSeatClass(seat)}
                              title={`Seat ${seat.number} - ${seat.status}`}
                            >
                              {seat.number}
                            </button>
                            {hoveredSeat?.number === seat.number &&
                              seat.booking && (
                                <div
                                  className={`absolute z-50 ${
                                    seat.number.startsWith("1")
                                      ? "top-full mt-2"
                                      : "bottom-full mb-2"
                                  } left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none`}
                                >
                                  <div className="font-semibold">
                                    {seat.booking.userId?.name || "Unknown"}
                                  </div>
                                  <div className="text-gray-300">
                                    {seat.booking.bookingReference ||
                                      seat.booking.ticketNumber ||
                                      "No ticket #"}
                                  </div>
                                  {seat.number.startsWith("1") ? (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                                      <div className="border-4 border-transparent border-b-gray-900"></div>
                                    </div>
                                  ) : (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                      <div className="border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={() => {
          if (confirmAction?.callback) {
            confirmAction.callback();
          }
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        title={confirmAction?.title || "Confirm Action"}
        message={confirmAction?.message || "Are you sure?"}
        confirmText="Confirm"
        cancelText="Cancel"
        type={confirmAction?.type || "info"}
      />
    </AdminLayout>
  );
};

export default ManageSeating;
