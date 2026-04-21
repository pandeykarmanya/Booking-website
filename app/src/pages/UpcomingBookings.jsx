import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5001/api/v1";

const bookingApi = {
  getUpcomingBookings: () =>
    axios.get(`${API_BASE}/booking/upcoming`, { withCredentials: true }),
  getAllBookings: () =>
    axios.get(`${API_BASE}/booking/all`, { withCredentials: true }),
};

// ✅ All statuses covered
const statusColors = {
  confirmed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  pending:   "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
  completed: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
};

function BookingCard({ booking, index }) {
  const bookingDate = new Date(booking.date);
  const day   = bookingDate.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = bookingDate.toLocaleDateString("en-IN", { month: "short" });
  const year  = bookingDate.getFullYear();

  // ✅ Check upcoming using date + startTime
  const now = new Date();
  const isUpcoming = (() => {
    if (!booking.startTime) return bookingDate >= now;
    const [h, m] = booking.startTime.split(":").map(Number);
    const start = new Date(booking.date);
    start.setHours(h, m, 0, 0);
    return start > now;
  })();

  // ✅ Check ongoing using startTime + endTime
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
    <div
      className="group relative bg-[#0f1117] border border-white/10 rounded-2xl p-5 flex gap-5 items-start hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Date Block */}
      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold text-indigo-300 leading-none">{day}</span>
        <span className="text-[10px] uppercase tracking-widest text-indigo-400">{month}</span>
        <span className="text-[10px] text-indigo-500">{year}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-base truncate">
            {booking.venue?.name || "Unknown Venue"}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              statusColors[booking.status] || "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
            }`}
          >
            {booking.status || "unknown"}
          </span>
        </div>

        <p className="text-sm text-zinc-400 mt-0.5 truncate">
          📍 {booking.venue?.location || "N/A"} &nbsp;·&nbsp; 👥 Capacity: {booking.venue?.capacity ?? "N/A"}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
          <span>🕐 {booking.startTime} – {booking.endTime}</span>
          <span>·</span>
          <span>👤 {booking.user?.name || "Unknown"}</span>
        </div>

        {/* Ongoing label */}
        {isOngoing && (
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            🔵 In Progress
          </span>
        )}
      </div>

      {/* Upcoming green dot */}
      {isUpcoming && !isOngoing && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]" />
      )}

      {/* Ongoing blue dot */}
      {isOngoing && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_2px_rgba(96,165,250,0.4)]" />
      )}
    </div>
  );
}

export default function UpcomingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("upcoming");

  const fetchBookings = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const res = type === "upcoming"
        ? await bookingApi.getUpcomingBookings()
        : await bookingApi.getAllBookings();

      // ✅ Correct response parsing for both endpoints
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

  // ✅ Filter using date + time, not just date
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
    <div className="min-h-screen bg-[#080a0f] text-white font-sans px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Bookings</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and track all venue reservations</p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl w-fit">
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "upcoming"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            🗓 Upcoming
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "all"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            📋 All Bookings
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16 text-red-400">
            <p className="text-4xl mb-3">⚠️</p>
            <p>{error}</p>
            <button
              onClick={() => fetchBookings(filter)}
              className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Upcoming Tab ── */}
        {!loading && !error && filter === "upcoming" && (
          <>
            {/* Ongoing group */}
            {ongoing.length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-blue-500 mb-3 font-semibold">
                  🔵 Ongoing — {ongoing.length}
                </p>
                <div className="flex flex-col gap-3">
                  {ongoing.map((b, i) => (
                    <BookingCard key={b._id} booking={b} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming group */}
            {upcoming.length === 0 && ongoing.length === 0 ? (
              <div className="text-center py-20 text-zinc-600">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-lg font-medium">No upcoming bookings</p>
                <p className="text-sm mt-1">All clear for now!</p>
              </div>
            ) : upcoming.length > 0 ? (
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-semibold">
                  🗓 Upcoming — {upcoming.length}
                </p>
                <div className="flex flex-col gap-3">
                  {upcoming.map((b, i) => (
                    <BookingCard key={b._id} booking={b} index={i} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* ── All Bookings Tab ── */}
        {!loading && !error && filter === "all" && (
          <>
            {/* Ongoing */}
            {ongoing.length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-blue-500 mb-3 font-semibold">
                  🔵 Ongoing — {ongoing.length}
                </p>
                <div className="flex flex-col gap-3">
                  {ongoing.map((b, i) => (
                    <BookingCard key={b._id} booking={b} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-semibold">
                  Upcoming — {upcoming.length}
                </p>
                <div className="flex flex-col gap-3">
                  {upcoming.map((b, i) => (
                    <BookingCard key={b._id} booking={b} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-semibold">
                  Past — {past.length}
                </p>
                <div className="flex flex-col gap-3 opacity-60">
                  {past.map((b, i) => (
                    <BookingCard key={b._id} booking={b} index={i} />
                  ))}
                </div>
              </div>
            )}

            {bookings.length === 0 && (
              <div className="text-center py-20 text-zinc-600">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-lg font-medium">No bookings found</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}