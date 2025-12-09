import { useState, useEffect } from "react";
import { TrendingUp, Ticket, X } from "lucide-react";
import Navbar from "../components/Navbar";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [user, setUser] = useState(null);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.map((p) => p[0].toUpperCase()).join("");
  };
  
  // Fetch logged-in user details
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/v1/user/me", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      console.log("USER RESPONSE:", data);

      // Based on your response structure, user data is in data.message
      if (data.success && data.message) {
        setUser(data.message);  // CHANGE THIS LINE
      }

    } catch (err) {
      console.error("Error:", err);
    }
  };

  fetchUser();
}, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navbar */}
        <Navbar />

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4">

            {/* Dynamic Profile Initials */}
            <div className="bg-blue-100 text-blue-700 font-semibold text-2xl rounded-full w-16 h-16 flex items-center justify-center">
               {user ? getInitials(user.name) : "U"}
            </div>

            {/* User Info */}
            <div>
              <h2 className="text-2xl font-semibold">
                {user ? user.name : "Loading..."}
              </h2>

              <p className="text-gray-500">
                Department: {user?.department || "Not Available"}
              </p>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button className="mt-4 md:mt-0 px-5 py-2 bg-blue-100 text-blue-700 font-medium rounded-full hover:bg-blue-200 transition">
            Edit Profile
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold mt-1">--</h3>
              <p className="text-sm text-gray-400 mt-1">Update soon</p>
            </div>
            <Ticket className="text-blue-600 w-8 h-8" />
          </div>

          <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500">Approved Bookings</p>
              <h3 className="text-2xl font-bold mt-1">--</h3>
              <p className="text-sm text-gray-400 mt-1">Update soon</p>
            </div>
            <TrendingUp className="text-blue-600 w-8 h-8" />
          </div>

          <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-500">Cancelled Bookings</p>
              <h3 className="text-2xl font-bold mt-1">--</h3>
              <p className="text-sm text-gray-400 mt-1">Update soon</p>
            </div>
            <X className="text-blue-600 w-8 h-8" />
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">My Bookings</h3>
            <p className="text-gray-500 text-sm">
              View and manage your event reservations
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b pb-2 mb-6">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-2 ${
                activeTab === "upcoming"
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-2 ${
                activeTab === "past"
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              Past Events
            </button>
          </div>

          {/* Placeholder for bookings */}
          <div className="text-center text-gray-400 py-10">
            No bookings found yet.
          </div>
        </div>
      </div>
    </div>
  );
}