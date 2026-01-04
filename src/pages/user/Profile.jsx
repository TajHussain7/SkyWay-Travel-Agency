import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/UserLayout";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    totalSpent: 0,
    pendingBookings: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    passport: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [alerts, setAlerts] = useState({ success: "", error: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadProfile();
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
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          dateOfBirth: userData.dateOfBirth || "",
          address: userData.address || "",
          passport: userData.passport || "",
        });
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Load user stats
      const bookingsResponse = await axios.get("/api/user/bookings", {
        withCredentials: true,
      });
      const bookings = bookingsResponse.data.data?.bookings || [];

      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(
        (b) => b.status === "confirmed"
      ).length;
      const totalSpent = bookings.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );
      const pendingBookings = bookings.filter(
        (b) => b.status === "pending"
      ).length;

      setStats({
        totalBookings,
        confirmedBookings,
        totalSpent,
        pendingBookings,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/api/user/profile", formData, {
        withCredentials: true,
      });

      if (response.data.success) {
        setAlerts({ success: "Profile updated successfully!", error: "" });
        setUser({ ...user, ...formData });
        setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      }
    } catch (error) {
      setAlerts({
        success: "",
        error: error.response?.data?.message || "Failed to update profile",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlerts({ success: "", error: "New passwords do not match" });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setAlerts({
        success: "",
        error: "Password must be at least 6 characters long",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      return;
    }

    try {
      const response = await axios.put(
        "/api/user/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setAlerts({ success: "Password changed successfully!", error: "" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
      }
    } catch (error) {
      setAlerts({
        success: "",
        error: error.response?.data?.message || "Failed to change password",
      });
      setTimeout(() => setAlerts({ success: "", error: "" }), 5000);
    }
  };

  const togglePassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  if (loading || !user) {
    return (
      <UserLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading your profile...</p>
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
                <i className="fas fa-user-circle me-3"></i>
                Profile Settings
              </h1>
              <p className="text-gray-100 text-lg">
                Manage your account information and preferences
              </p>
            </div>
            <button
              className="bg-white text-primary hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
              onClick={loadProfile}
            >
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8">
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full w-28 h-28 flex items-center justify-center text-4xl font-bold text-primary shadow-xl mb-4">
                  {getInitials()}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {user.name || "User"}
                </h2>
                <p className="text-gray-100 text-lg">
                  {user.email || "No email"}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
              <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats.totalBookings}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Bookings
                </div>
              </div>
              <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.confirmedBookings}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Confirmed
                </div>
              </div>
              <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${stats.totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Spent
                </div>
              </div>
              <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {stats.pendingBookings}
                </div>
                <div className="text-sm text-gray-600 font-medium">Pending</div>
              </div>
            </div>
          </div>
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-user"></i>
                Personal Information
              </h3>
            </div>

            {alerts.success && (
              <div className="m-6 bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-center gap-3 animate-fade-in">
                <i className="fas fa-check-circle text-green-500 text-xl"></i>
                <span className="text-green-800 font-semibold">
                  {alerts.success}
                </span>
              </div>
            )}
            {alerts.error && (
              <div className="m-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center gap-3 animate-fade-in">
                <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
                <span className="text-red-800 font-semibold">
                  {alerts.error}
                </span>
              </div>
            )}

            <form
              id="profileForm"
              onSubmit={handleProfileUpdate}
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-signature text-gray-400 me-2"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-envelope text-gray-400 me-2"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-phone text-gray-400 me-2"></i>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-calendar text-gray-400 me-2"></i>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="form-control cursor-pointer hover:border-gray-400 transition-all duration-200 bg-white"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-map-marker-alt text-gray-400 me-2"></i>
                    Address
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="123 Main St, City, Country"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-passport text-gray-400 me-2"></i>
                    Passport Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.passport}
                    onChange={(e) =>
                      setFormData({ ...formData, passport: e.target.value })
                    }
                    placeholder="A12345678"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
                  onClick={() => {
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                      dateOfBirth: user.dateOfBirth || "",
                      address: user.address || "",
                      passport: user.passport || "",
                    });
                  }}
                >
                  <i className="fas fa-undo"></i>
                  Reset
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <i className="fas fa-save"></i>
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-lock"></i>
                Change Password
              </h3>
            </div>
            <form
              id="passwordForm"
              onSubmit={handlePasswordChange}
              className="p-6"
            >
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-key text-gray-400 me-2"></i>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.currentPassword ? "text" : "password"}
                      className="form-control pr-12"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => togglePassword("currentPassword")}
                    >
                      <i
                        className={`fas fa-${
                          showPassword.currentPassword ? "eye-slash" : "eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-lock text-gray-400 me-2"></i>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.newPassword ? "text" : "password"}
                      className="form-control pr-12"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => togglePassword("newPassword")}
                    >
                      <i
                        className={`fas fa-${
                          showPassword.newPassword ? "eye-slash" : "eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label text-gray-700 font-medium mb-2">
                    <i className="fas fa-lock text-gray-400 me-2"></i>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      className="form-control pr-12"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => togglePassword("confirmPassword")}
                    >
                      <i
                        className={`fas fa-${
                          showPassword.confirmPassword ? "eye-slash" : "eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <i className="fas fa-key"></i>
                  Change Password
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-red-200">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i>
                Danger Zone
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                <p className="text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete your account? This action cannot be undone."
                      )
                    ) {
                      if (
                        window.confirm(
                          "This will permanently delete all your data. Are you absolutely sure?"
                        )
                      ) {
                        // TODO: Implement delete account API call
                        console.log("Delete account");
                      }
                    }
                  }}
                >
                  <i className="fas fa-trash"></i>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;
