import { useState, useEffect } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

const API_BASE = "http://localhost:5001/api/v1";

const bookingApi = {
  getUpcomingBookings: () =>
    axios.get(`${API_BASE}/booking/upcoming`, { withCredentials: true }),
  getAllBookings: () =>
    axios.get(`${API_BASE}/booking/all`, { withCredentials: true }),
};

const statusStyles = {
  confirmed: "bg-green-100 text-green-700",
  pending:   "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

function BookingCard({ booking }) {
  const bookingDate = new Date(booking.date);
  const day   = bookingDate.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = bookingDate.toLocaleDateString("en-IN", { month: "short" });
  const year  = bookingDate.getFullYear();

  const now = new Date();

  const isOngoing = (() => {
    if (!booking.startTime || !booking.endTime) return false;
    const [sh, sm] = booking.startTime.split(":").map(Number);
    const [eh, em] = booking.endTime.split(":").map(Number);
    const start = new Date(booking.date);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(booking.date);
    end.setHours(eh, em, 0, 0);
    return now >= start && now < end;
  })();

  return (
    <div className="flex gap-4 items-start border border-gray-100 rounded-xl px-5 py-4 bg-white hover:shadow-sm transition">
      {/* Date Block */}
      <div className="shrink-0 w-14 h-14 rounded-xl bg-[#f3e8eb] flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold text-[#9a031e] leading-none">{day}</span>
        <span className="text-[10px] uppercase tracking-widest text-[#9a031e]">{month}</span>
        <span className="text-[10px] text-[#c0536a]">{year}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-gray-800 font-semibold text-base truncate">
            {booking.venue?.name || "Unknown Venue"}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
            statusStyles[booking.status] || "bg-gray-100 text-gray-600"
          }`}>
            {booking.status || "unknown"}
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-0.5 truncate">
          📍 {booking.venue?.location || "N/A"} &nbsp;·&nbsp; 👥 Capacity: {booking.venue?.capacity ?? "N/A"}
        </p>

        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          <span>🕐 {booking.startTime} – {booking.endTime}</span>
          <span>·</span>
          <span>👤 {booking.user?.name || "Unknown"}</span>
        </div>

        {isOngoing && (
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            🔵 In Progress
          </span>
        )}
      </div>
    </div>
  );
}

export default function UpcomingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("upcoming");
  const [activeTab, setActiveTab] = useState("bookings");

  const fetchBookings = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const res = type === "upcoming"
        ? await bookingApi.getUpcomingBookings()
        : await bookingApi.getAllBookings();
      const data = res.data?.data || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(filter);
  }, [filter]);

  const now = new Date();

  const upcoming = bookings.filter((b) => {
    if (!b.startTime) return false;
    const [h, m] = b.startTime.split(":").map(Number);
    const start = new Date(b.date);
    start.setHours(h, m, 0, 0);
    return start > now;
  });

  const ongoing = bookings.filter((b) => {
    if (!b.startTime || !b.endTime) return false;
    const [sh, sm] = b.startTime.split(":").map(Number);
    const [eh, em] = b.endTime.split(":").map(Number);
    const start = new Date(b.date);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(b.date);
    end.setHours(eh, em, 0, 0);
    return now >= start && now < end;
  });

  const past = bookings.filter((b) => {
    if (!b.endTime) return false;
    const [h, m] = b.endTime.split(":").map(Number);
    const end = new Date(b.date);
    end.setHours(h, m, 0, 0);
    return end <= now;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="pt-28 px-6 pb-10 max-w-4xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl font-bold text-[#9a031e] mb-8">Pre-Bookings</h1>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-6 bg-white border border-gray-200 p-1 rounded-xl w-fit shadow-sm">
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "upcoming"
                ? "bg-[#9a031e] text-white shadow"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            🗓 Upcoming
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "all"
                ? "bg-[#9a031e] text-white shadow"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            📋 All Bookings
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchBookings(filter)}
              className="px-4 py-2 bg-[#9a031e] text-white rounded-lg text-sm hover:bg-[#7a0118] transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Upcoming Tab ── */}
        {!loading && !error && filter === "upcoming" && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">

            {ongoing.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">
                  🔵 Ongoing — {ongoing.length}
                </p>
                <div className="flex flex-col gap-3">
                  {ongoing.map((b, i) => <BookingCard key={b._id} booking={b} index={i} />)}
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">
                  🗓 Upcoming — {upcoming.length}
                </p>
                <div className="flex flex-col gap-3">
                  {upcoming.map((b, i) => <BookingCard key={b._id} booking={b} index={i} />)}
                </div>
              </div>
            )}

            {upcoming.length === 0 && ongoing.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-500 font-medium">No upcoming bookings</p>
                <p className="text-gray-400 text-sm mt-1">All clear for now!</p>
              </div>
            )}
          </div>
        )}

        {/* ── All Bookings Tab ── */}
        {!loading && !error && filter === "all" && (
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">

            {ongoing.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">
                  🔵 Ongoing — {ongoing.length}
                </p>
                <div className="flex flex-col gap-3">
                  {ongoing.map((b, i) => <BookingCard key={b._id} booking={b} index={i} />)}
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">
                  Upcoming — {upcoming.length}
                </p>
                <div className="flex flex-col gap-3">
                  {upcoming.map((b, i) => <BookingCard key={b._id} booking={b} index={i} />)}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">
                  Past — {past.length}
                </p>
                <div className="flex flex-col gap-3 opacity-60">
                  {past.map((b, i) => <BookingCard key={b._id} booking={b} index={i} />)}
                </div>
              </div>
            )}

            {bookings.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-500 font-medium">No bookings found</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}