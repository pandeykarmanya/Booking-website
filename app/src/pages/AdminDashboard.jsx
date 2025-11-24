import { useState, useRef, useEffect } from "react";
import { Users, Menu, X, Calendar, Shield, XCircle, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";


export default function AdminDashboard() {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeUsers: 0,
    admins: 0,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data
  useEffect(() => {
    if (activeTab === "bookings") fetchBookings();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "stats") fetchStats();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      setBookings(bookings.filter((b) => b._id !== bookingId));
      alert("Booking cancelled");
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await fetch(`/api/users/${userId}/make-admin`, { method: "PATCH" });
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: "admin" } : user
        )
      );
      alert("User promoted to admin");
    } catch (err) {
      console.error("Error promoting user:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-transparent z-50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="bg-linear-to-r from-[rgba(120,2,24,0.6)] to-[rgba(154,3,30,0.5)] backdrop-blur-md rounded-full shadow-md flex justify-between items-center px-6 py-3 text-white">
            {/* Logo */}
            <Link
              to="/"
              className="text-2xl font-bold hover:opacity-90 transition-opacity"
            >
              Booking
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden md:flex space-x-6 font-medium">
              <li>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`hover:text-gray-200 ${
                    activeTab === "bookings" ? "underline font-semibold" : ""
                  }`}
                >
                  Bookings
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`hover:text-gray-200 ${
                    activeTab === "users" ? "underline font-semibold" : ""
                  }`}
                >
                  Users
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`hover:text-gray-200 ${
                    activeTab === "stats" ? "underline font-semibold" : ""
                  }`}
                >
                  Stats
                </button>
              </li>
            </ul>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-lg p-2">
                    <button
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden mt-3 bg-[rgba(154,3,30,0.3)] backdrop-blur-md rounded-2xl text-white shadow-lg py-4 space-y-3 text-center">
              <button
                onClick={() => {
                  setActiveTab("bookings");
                  setMenuOpen(false);
                }}
                className="block hover:text-gray-200"
              >
                Bookings
              </button>
              <button
                onClick={() => {
                  setActiveTab("users");
                  setMenuOpen(false);
                }}
                className="block hover:text-gray-200"
              >
                Users
              </button>
              <button
                onClick={() => {
                  setActiveTab("stats");
                  setMenuOpen(false);
                }}
                className="block hover:text-gray-200"
              >
                Stats
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        {activeTab === "bookings" && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#9a031e]" />
              All Bookings
            </h2>

            <div className="bg-white shadow rounded-lg p-4 space-y-3">
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center">No bookings found.</p>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex justify-between items-center border-b last:border-none pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-700">
                        {booking.hallName} — {booking.date}
                      </p>
                      <p className="text-sm text-gray-500">
                        Department: {booking.department}
                      </p>
                    </div>
                    <button
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 transition"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#9a031e]" />
              Manage Users
            </h2>

            <div className="bg-white shadow rounded-lg p-4 space-y-3">
              {users.length === 0 ? (
                <p className="text-gray-500 text-center">No users found.</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center border-b last:border-none pb-2"
                  >
                    <div>
                      <p className="font-medium text-gray-700">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        Department: {user.department} | Role: {user.role}
                      </p>
                    </div>

                    {user.role !== "admin" && (
                      <button
                        className="flex items-center gap-1 text-green-700 hover:text-green-900 transition"
                        onClick={() => handleMakeAdmin(user._id)}
                      >
                        <Shield className="w-4 h-4" />
                        Make Admin
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "stats" && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Dashboard Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-2xl font-bold text-[#9a031e]">
                  {stats.totalBookings}
                </p>
                <p className="text-gray-600">Total Bookings</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-2xl font-bold text-[#9a031e]">
                  {stats.activeUsers}
                </p>
                <p className="text-gray-600">Active Users</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-2xl font-bold text-[#9a031e]">
                  {stats.admins}
                </p>
                <p className="text-gray-600">Admins</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
