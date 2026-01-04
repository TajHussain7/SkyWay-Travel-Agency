import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Home Pages
import Home from "./pages/home/Home";
import Flights from "./pages/home/Flights";
import Umrah from "./pages/home/Umrah";
import Offers from "./pages/home/Offers";
import AboutUs from "./pages/home/AboutUs";
import ContactUs from "./pages/home/ContactUs";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// User Pages
import Dashboard from "./pages/user/Dashboard";
import MyBookings from "./pages/user/MyBookings";
import Profile from "./pages/user/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageFlights from "./pages/admin/ManageFlights";
import AddFlight from "./pages/admin/AddFlight";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageOffers from "./pages/admin/ManageOffers";
import ManageUmrah from "./pages/admin/ManageUmrah";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import ManageLocations from "./pages/admin/ManageLocations";

// Other
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/umrah" element={<Umrah />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Protected User Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/flights" element={<ManageFlights />} />
        <Route path="/admin/add-flight" element={<AddFlight />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/bookings" element={<ManageBookings />} />
        <Route path="/admin/offers" element={<ManageOffers />} />
        <Route path="/admin/umrah" element={<ManageUmrah />} />
        <Route path="/admin/locations" element={<ManageLocations />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
