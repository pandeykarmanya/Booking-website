import { useState, useEffect } from "react";
import { TrendingUp, Ticket, X, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import CollegeHeader from "../components/CollegeHeader";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [user, setUser] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [ongoingBookings, setOngoingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [cancelError, setCancelError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const handleCancelBooking = async () => {
    setCancelError("");
    try {
      await fetch(`http://localhost:5001/api/v1/booking/cancel/${selectedBookingId}`, {
        method: "PATCH",
        credentials: "include",
      });
      setUpcomingBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBookingId ? { ...b, status: "cancelled" } : b
        )
      );
      setShowCancelModal(false);
    } catch (err) {
      setCancelError("Failed to cancel booking. Try again.");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((p) => p[0].toUpperCase()).join("");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/v1/user/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.data) setUser(data.data);
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          "http://localhost:5001/api/v1/booking/my-bookings",
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success && data.data) {
          setUpcomingBookings(data.data.upcoming || []);
          setOngoingBookings(data.data.ongoing || []);
          setPastBookings(data.data.past || []);
        }
      } catch (err) {
        console.error("Booking fetch error:", err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-6">
      <Navbar />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* PROFILE HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-700 font-semibold text-2xl rounded-full w-16 h-16 flex items-center justify-center">
              {user ? getInitials(user.name) : "U"}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {user ? user.name : "Loading..."}
              </h2>
              <p className="text-gray-500">Email: {user?.email || "Not Available"}</p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard label="Total Bookings" value={upcomingBookings.length + ongoingBookings.length + pastBookings.length} icon={<Ticket />} color="blue" />
          <StatCard label="Upcoming" value={upcomingBookings.length} icon={<TrendingUp />} color="blue" />
          <StatCard label="Ongoing" value={ongoingBookings.length} icon={<Clock />} color="yellow" />
          <StatCard label="Past" value={pastBookings.length} icon={<X />} color="gray" />
        </div>

        {/* BOOKINGS */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">My Bookings</h3>

          {/* TABS */}
          <div className="flex space-x-6 border-b mb-6">
            {[
              { key: "upcoming", label: "Upcoming" },
              { key: "ongoing", label: "Ongoing", count: ongoingBookings.length },
              { key: "past", label: "Past Events" },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-2 flex items-center gap-2 ${
                  activeTab === key
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {label}
                {/* Badge for ongoing count */}
                {key === "ongoing" && count > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* BOOKINGS LIST */}
          {loadingBookings ? (
            <Empty text="Loading bookings..." />
          ) : activeTab === "upcoming" ? (
            upcomingBookings.length === 0 ? (
              <Empty text="No upcoming bookings" />
            ) : (
              upcomingBookings.map((b) => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  onCancel={(id) => { setSelectedBookingId(id); setShowCancelModal(true); }}
                />
              ))
            )
          ) : activeTab === "ongoing" ? (
            ongoingBookings.length === 0 ? (
              <Empty text="No ongoing bookings" />
            ) : (
              ongoingBookings.map((b) => (
                <BookingCard key={b._id} booking={b} ongoing />
              ))
            )
          ) : pastBookings.length === 0 ? (
            <Empty text="No past bookings" />
          ) : (
            pastBookings.map((b) => (
              <BookingCard key={b._id} booking={b} past />
            ))
          )}
        </div>
      </div>

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Cancel booking?</h3>
            <p className="text-sm text-gray-500 mb-4">This cannot be undone.</p>
            {cancelError && <p className="text-red-500 text-sm mb-3">{cancelError}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm border rounded-lg">Keep it</button>
              <button onClick={handleCancelBooking}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">Yes, cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------ COMPONENTS ------------------ */

function StatCard({ label, value, icon, color = "blue" }) {
  const colorMap = {
    blue: "text-blue-600",
    yellow: "text-yellow-500",
    red: "text-red-500",
  };
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
      <div>
        <p className="text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`w-8 h-8 ${colorMap[color]}`}>{icon}</div>
    </div>
  );
}

function BookingCard({ booking, past, ongoing, onCancel }) {
  const isCancelled = booking.status === "cancelled";

  const statusConfig = isCancelled
    ? { label: "Cancelled", className: "bg-red-100 text-red-700" }
    : ongoing
    ? { label: "Ongoing", className: "bg-yellow-100 text-yellow-700" }
    : past
    ? { label: "Completed", className: "bg-green-100 text-green-700" }
    : { label: "Upcoming", className: "bg-green-100 text-green-700" };

  return (
    <div className={`border rounded-xl p-4 mb-4 flex justify-between items-center ${ongoing ? "border-yellow-200 bg-yellow-50/30" : ""}`}>
      <div>
        <h4 className="font-semibold">{booking.venue?.name || "Venue not found"}</h4>
        <p className="text-sm text-gray-500">
          {new Date(booking.date).toLocaleDateString()} · {booking.startTime} - {booking.endTime}
        </p>
        {ongoing && (
          <p className="text-xs text-yellow-600 font-medium mt-1">🟡 Currently in progress</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 text-xs rounded-full ${statusConfig.className}`}>
          {statusConfig.label}
        </span>

        {!past && !ongoing && !isCancelled && onCancel && (
          <button
            onClick={() => onCancel(booking._id)}
            className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-center text-gray-400 py-10">{text}</div>;
}