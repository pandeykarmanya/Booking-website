import { useState, useEffect } from "react";
import { Users, Calendar, Shield, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, activeUsers: 0, admins: 0 });

  // Fetch data from backend (replace URLs with your endpoints)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#780218]/80 to-[#9a031e]/70 backdrop-blur-md text-white shadow-md px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex space-x-6">
          {["bookings", "users", "stats"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`hover:text-gray-200 capitalize ${
                activeTab === tab ? "font-bold underline" : ""
              }`}
            >
              {tab}
            </button>
          ))}
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
