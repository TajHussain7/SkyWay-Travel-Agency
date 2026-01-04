import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const UserSidebar = ({ isExpanded, setIsExpanded }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (error) {
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/dashboard", icon: "fa-tachometer-alt", label: "Dashboard" },
    { path: "/my-bookings", icon: "fa-ticket-alt", label: "My Bookings" },
    { path: "/flights", icon: "fa-search", label: "Search Flights" },
    { path: "/profile", icon: "fa-user", label: "Profile" },
  ];

  return (
    <div
      className={`${
        isExpanded ? "w-64" : "w-20"
      } h-screen bg-gradient-to-b from-primary to-primary-dark text-white p-0 fixed overflow-y-auto z-40 shadow-lg transition-all duration-300`}
    >
      {/* Logo Section */}
      <div className="p-5 border-b border-white border-opacity-20 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-2xl hover:text-accent transition-colors"
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <i className={`fas ${isExpanded ? "fa-bars" : "fa-bars"}`}></i>
          </button>
          {isExpanded && <h2 className="text-xl font-bold">SkyWay</h2>}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="py-5 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center ${
              isExpanded ? "gap-3 px-6" : "justify-center px-4"
            } py-3 font-medium transition-all duration-300 border-l-4 ${
              isActive(item.path)
                ? "bg-white bg-opacity-20 border-l-accent text-white"
                : "border-l-transparent hover:bg-white hover:bg-opacity-10"
            }`}
            title={!isExpanded ? item.label : ""}
          >
            <i
              className={`fas ${item.icon} ${isExpanded ? "w-5" : "text-xl"}`}
            ></i>
            {isExpanded && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Logout */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          className={`w-full flex items-center ${
            isExpanded ? "gap-3 px-6" : "justify-center px-4"
          } py-3 font-medium transition-all duration-300 border-l-4 border-l-transparent hover:bg-white hover:bg-opacity-10 text-left`}
          title={!isExpanded ? "Logout" : ""}
        >
          <i
            className={`fas fa-sign-out-alt ${isExpanded ? "w-5" : "text-xl"}`}
          ></i>
          {isExpanded && <span>Logout</span>}
        </button>
      </nav>
    </div>
  );
};

export default UserSidebar;
