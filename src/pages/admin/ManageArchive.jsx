import { useState, useEffect } from "react";
import { format } from "date-fns";
import AdminLayout from "../../components/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const ManageArchive = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [contactQueries, setContactQueries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [notification, setNotification] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showQueryModal, setShowQueryModal] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/archive/stats`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchArchivedBookings = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/bookings?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching archived bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedFlights = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/flights?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setFlights(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching archived flights:", error);
    } finally {
      setLoading(false);
    }
  };

  const runAutoArchive = async () => {
    try {
      setActionLoading("autoArchive");
      const response = await fetch(`${API_URL}/admin/archive/run`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("success", "Auto-archive completed successfully!");
        fetchStats();
        if (activeTab === "bookings") fetchArchivedBookings();
        else fetchArchivedFlights();
      } else {
        showNotification("error", data.message || "Failed to run auto-archive");
      }
    } catch (error) {
      showNotification("error", "Error running auto-archive");
    } finally {
      setActionLoading(null);
    }
  };

  const restoreBooking = async (id) => {
    try {
      setActionLoading(id);
      const response = await fetch(`${API_URL}/admin/archive/booking/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        showNotification("success", "Booking restored successfully!");
        fetchArchivedBookings(pagination.page);
        fetchStats();
      } else {
        showNotification("error", "Failed to restore booking");
      }
    } catch (error) {
      showNotification("error", "Error restoring booking");
    } finally {
      setActionLoading(null);
    }
  };

  const restoreFlight = async (id) => {
    try {
      setActionLoading(id);
      const response = await fetch(`${API_URL}/admin/archive/flight/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        showNotification("success", "Flight restored successfully!");
        fetchArchivedFlights(pagination.page);
        fetchStats();
      } else {
        showNotification("error", "Failed to restore flight");
      }
    } catch (error) {
      showNotification("error", "Error restoring flight");
    } finally {
      setActionLoading(null);
    }
  };

  const fetchArchivedUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/users?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching archived users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/feedback?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactQueries = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/archive/contact-queries?page=${page}&limit=${pagination.limit}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setContactQueries(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching contact queries:", error);
    } finally {
      setLoading(false);
    }
  };

  const restoreUser = async (id) => {
    try {
      setActionLoading(id);
      const response = await fetch(`${API_URL}/admin/archive/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        showNotification("success", "User account restored successfully!");
        fetchArchivedUsers(pagination.page);
        fetchStats();
      } else {
        showNotification("error", "Failed to restore user");
      }
    } catch (error) {
      showNotification("error", "Error restoring user");
    } finally {
      setActionLoading(null);
    }
  };

  const deletePermanentlyUser = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) {
      return;
    }
    try {
      setActionLoading(id);
      const response = await fetch(
        `${API_URL}/admin/archive/user/${id}/permanent`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (response.ok) {
        showNotification("success", "User deleted permanently!");
        fetchArchivedUsers(pagination.page);
        fetchStats();
      } else {
        showNotification("error", "Failed to delete user permanently");
      }
    } catch (error) {
      showNotification("error", "Error deleting user");
    } finally {
      setActionLoading(null);
    }
  };

  const updateFeedbackStatus = async (id, status) => {
    try {
      setActionLoading(id);
      const response = await fetch(`${API_URL}/admin/archive/feedback/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        showNotification("success", "Feedback status updated!");
        fetchFeedback(pagination.page);
      } else {
        showNotification("error", "Failed to update feedback");
      }
    } catch (error) {
      showNotification("error", "Error updating feedback");
    } finally {
      setActionLoading(null);
    }
  };

  const updateQueryStatus = async (id, status) => {
    try {
      setActionLoading(id);
      const response = await fetch(
        `${API_URL}/admin/archive/contact-queries/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );
      if (response.ok) {
        showNotification("success", "Query status updated!");
        fetchContactQueries(pagination.page);
        setShowQueryModal(false);
      } else {
        showNotification("error", "Failed to update query");
      }
    } catch (error) {
      showNotification("error", "Error updating query");
    } finally {
      setActionLoading(null);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchArchivedBookings();
    } else if (activeTab === "flights") {
      fetchArchivedFlights();
    } else if (activeTab === "users") {
      fetchArchivedUsers();
    } else if (activeTab === "feedback") {
      fetchFeedback();
    } else if (activeTab === "queries") {
      fetchContactQueries();
    }
  }, [activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const getReasonBadge = (reason) => {
    const badges = {
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
      expired: { color: "bg-yellow-100 text-yellow-800", label: "Expired" },
      manual: { color: "bg-gray-100 text-gray-800", label: "Manual" },
      self_deleted: {
        color: "bg-orange-100 text-orange-800",
        label: "Self Deleted",
      },
      admin_deleted: {
        color: "bg-red-100 text-red-800",
        label: "Admin Deleted",
      },
    };
    const badge = badges[reason] || badges.manual;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { color: "bg-blue-100 text-blue-800", label: "New" },
      read: { color: "bg-gray-100 text-gray-800", label: "Read" },
      resolved: { color: "bg-green-100 text-green-800", label: "Resolved" },
      in_progress: {
        color: "bg-yellow-100 text-yellow-800",
        label: "In Progress",
      },
      closed: { color: "bg-gray-100 text-gray-800", label: "Closed" },
    };
    const badge = badges[status] || badges.new;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { color: "bg-gray-100 text-gray-800", label: "Low" },
      medium: { color: "bg-blue-100 text-blue-800", label: "Medium" },
      high: { color: "bg-orange-100 text-orange-800", label: "High" },
      urgent: { color: "bg-red-100 text-red-800", label: "Urgent" },
    };
    const badge = badges[priority] || badges.medium;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star text-sm ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          ></i>
        ))}
      </div>
    );
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <i className="fas fa-archive text-primary"></i>
            Archive Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage archived bookings and flights
          </p>
        </div>
        <button
          onClick={runAutoArchive}
          disabled={actionLoading === "autoArchive"}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {actionLoading === "autoArchive" ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-sync-alt"></i>
          )}
          Run Auto-Archive
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-ticket-alt text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Archived Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.bookings.archived}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.bookings.active}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-plane text-purple-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Archived Flights</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.flights.archived}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-plane-departure text-orange-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Flights</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.flights.active}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "bookings"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-ticket-alt mr-2"></i>
              Bookings
            </button>
            <button
              onClick={() => setActiveTab("flights")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "flights"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-plane mr-2"></i>
              Flights
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              Deleted Users
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "feedback"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-comment-dots mr-2"></i>
              Feedback
            </button>
            <button
              onClick={() => setActiveTab("queries")}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "queries"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className="fas fa-headset mr-2"></i>
              Contact Queries
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fas fa-spinner fa-spin text-3xl text-primary"></i>
            </div>
          ) : activeTab === "bookings" ? (
            /* Bookings Table */
            bookings.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-archive text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No archived bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Booking ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Details
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Archived On
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm font-mono">
                          {booking._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.userId?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.userId?.email || ""}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.bookingType === "flight"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {booking.bookingType === "flight"
                              ? "Flight"
                              : "Package"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {booking.bookingType === "flight"
                            ? `${booking.flightId?.origin?.code || "?"} → ${
                                booking.flightId?.destination?.code || "?"
                              }`
                            : booking.packageOfferId?.name || "Package"}
                        </td>
                        <td className="py-3 px-4">
                          {getReasonBadge(booking.archivedReason)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(booking.archivedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => restoreBooking(booking._id)}
                            disabled={actionLoading === booking._id}
                            className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading === booking._id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <>
                                <i className="fas fa-undo mr-1"></i> Restore
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "flights" ? (
            /* Flights Table */
            flights.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-plane text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No archived flights found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Flight #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Route
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Airline
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Departure
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Archived On
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((flight) => (
                      <tr
                        key={flight._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {flight.number}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {flight.origin?.code || "?"} →{" "}
                          {flight.destination?.code || "?"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {flight.airline}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(flight.departureTime)}
                        </td>
                        <td className="py-3 px-4">
                          {getReasonBadge(flight.archivedReason)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(flight.archivedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => restoreFlight(flight._id)}
                            disabled={actionLoading === flight._id}
                            className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading === flight._id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <>
                                <i className="fas fa-undo mr-1"></i> Restore
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "users" ? (
            /* Users Table */
            users.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-user-slash text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No deleted users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Deleted
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Time Remaining
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {user.name || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {user.phone || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(user.archivedAt)}
                        </td>
                        <td className="py-3 px-4">
                          {getTimeRemaining(user.archiveExpiresAt) ? (
                            <span
                              className={`text-sm font-medium ${
                                getTimeRemaining(user.archiveExpiresAt) ===
                                "Expired"
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {getTimeRemaining(user.archiveExpiresAt)}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getReasonBadge(user.archiveReason)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => restoreUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-50"
                            >
                              {actionLoading === user._id ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <>
                                  <i className="fas fa-undo mr-1"></i> Restore
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => deletePermanentlyUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              <i className="fas fa-trash mr-1"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "feedback" ? (
            /* Feedback Table */
            feedback.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-comment text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No feedback found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Rating
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Message
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.userName || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.userEmail}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.type === "account_deletion"
                                ? "bg-red-100 text-red-800"
                                : item.type === "suggestion"
                                ? "bg-blue-100 text-blue-800"
                                : item.type === "complaint"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.type?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.rating ? getRatingStars(item.rating) : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                          {item.message}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>
                              updateFeedbackStatus(
                                item._id,
                                item.status === "new" ? "read" : "resolved"
                              )
                            }
                            disabled={actionLoading === item._id}
                            className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading === item._id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : item.status === "new" ? (
                              <>
                                <i className="fas fa-envelope-open mr-1"></i>{" "}
                                Mark Read
                              </>
                            ) : (
                              <>
                                <i className="fas fa-check-circle mr-1"></i>{" "}
                                Mark Resolved
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "queries" ? (
            /* Contact Queries Table */
            contactQueries.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-envelope text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No contact queries found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        From
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Subject
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Priority
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactQueries.map((query) => (
                      <tr
                        key={query._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {query.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {query.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                          {query.subject}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              query.type === "account_recovery"
                                ? "bg-purple-100 text-purple-800"
                                : query.type === "booking"
                                ? "bg-blue-100 text-blue-800"
                                : query.type === "complaint"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {query.type?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getPriorityBadge(query.priority)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(query.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(query.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              setSelectedQuery(query);
                              setShowQueryModal(true);
                            }}
                            className="text-primary hover:text-primary-dark text-sm font-medium"
                          >
                            <i className="fas fa-eye mr-1"></i> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : null}
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  if (activeTab === "bookings")
                    fetchArchivedBookings(pagination.page - 1);
                  else if (activeTab === "flights")
                    fetchArchivedFlights(pagination.page - 1);
                  else if (activeTab === "users")
                    fetchArchivedUsers(pagination.page - 1);
                  else if (activeTab === "feedback")
                    fetchFeedback(pagination.page - 1);
                  else if (activeTab === "queries")
                    fetchContactQueries(pagination.page - 1);
                }}
                disabled={pagination.page === 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => {
                  if (activeTab === "bookings")
                    fetchArchivedBookings(pagination.page + 1);
                  else if (activeTab === "flights")
                    fetchArchivedFlights(pagination.page + 1);
                  else if (activeTab === "users")
                    fetchArchivedUsers(pagination.page + 1);
                  else if (activeTab === "feedback")
                    fetchFeedback(pagination.page + 1);
                  else if (activeTab === "queries")
                    fetchContactQueries(pagination.page + 1);
                }}
                disabled={pagination.page === pagination.pages}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Query Detail Modal */}
      {showQueryModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{selectedQuery.subject}</h3>
                  <p className="text-primary-100 text-sm mt-1">
                    From: {selectedQuery.name} ({selectedQuery.email})
                  </p>
                </div>
                <button
                  onClick={() => setShowQueryModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex gap-2 mb-4">
                {getStatusBadge(selectedQuery.status)}
                {getPriorityBadge(selectedQuery.priority)}
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {selectedQuery.type?.replace("_", " ")}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedQuery.message}
                </p>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                <p>
                  <i className="fas fa-calendar mr-2"></i>
                  Received: {formatDate(selectedQuery.createdAt)}
                </p>
                {selectedQuery.phone && (
                  <p>
                    <i className="fas fa-phone mr-2"></i>
                    Phone: {selectedQuery.phone}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateQueryStatus(selectedQuery._id, "in_progress")
                  }
                  disabled={actionLoading === selectedQuery._id}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() =>
                    updateQueryStatus(selectedQuery._id, "resolved")
                  }
                  disabled={actionLoading === selectedQuery._id}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with AdminLayout
const ManageArchivePage = () => (
  <AdminLayout>
    <ManageArchive />
  </AdminLayout>
);

export default ManageArchivePage;
