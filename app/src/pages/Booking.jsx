import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { checkAvailability } from "../api/bookingApi";
import axios from "../api/axiosInstance";
import Navbar from "../components/Navbar";

function BookingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [allVenues, setAllVenues] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Live bookings state
  const [todayBookings, setTodayBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);

  // Fetch all venues
  useEffect(() => {
    const fetchAllVenues = async () => {
      try {
        const res = await axios.get("/venues");
        setAllVenues(res.data?.venues || []);
      } catch (err) {
        console.error("Failed to fetch venues", err);
      }
    };
    fetchAllVenues();
  }, []);

  // Fetch today's bookings — trust backend, no client-side re-filter
  useEffect(() => {
    const fetchTodayBookings = async () => {
      try {
        setLoadingBookings(true);
        const res = await axios.get("/booking/today");
        const all = res.data?.data || [];
        setTodayBookings(all); // ✅ set once, backend already filters today + non-cancelled
      } catch (err) {
        console.error("Failed to fetch today's bookings", err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchTodayBookings();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTodayBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll animation — only runs when cards are available
  useEffect(() => {
    if (todayBookings.length === 0) return;

    const track = scrollRef.current;
    if (!track) return;

    positionRef.current = 0;
    const speed = 0.6; // px per frame

    const animate = () => {
      if (!isPausedRef.current && track) {
        positionRef.current += speed;
        const halfWidth = track.scrollWidth / 2; // ✅ works because cards are duplicated
        if (positionRef.current >= halfWidth) {
          positionRef.current = 0;
        }
        track.style.transform = `translateX(-${positionRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [todayBookings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateTime = () => {
    const { date, startTime, endTime } = formData;

    if (!date || !startTime || !endTime) {
      setErrorMessage("Please select date, start time, and end time");
      setShowError(true);
      return false;
    }

    const selectedStartDateTime = new Date(`${date}T${startTime}`);
    const selectedEndDateTime = new Date(`${date}T${endTime}`);
    const currentDateTime = new Date();

    if (selectedStartDateTime <= currentDateTime) {
      setErrorMessage(
        "The selected start time has already passed. Please choose a future time for your booking."
      );
      setShowError(true);
      return false;
    }

    if (selectedEndDateTime <= selectedStartDateTime) {
      setErrorMessage(
        "End time must be after start time. Please adjust your booking times."
      );
      setShowError(true);
      return false;
    }

    return true;
  };

  const handleCheck = async () => {
    if (!validateTime()) return;
    setIsChecking(true);
    try {
      const response = await checkAvailability(
        formData.date,
        formData.startTime,
        formData.endTime
      );
      navigate("/available-venues", {
        state: {
          availableVenues: response.data.data.availableVenues,
          allVenues: allVenues,
          bookingDetails: formData,
        },
      });
    } catch (error) {
      console.error("Error checking availability:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const closeError = () => {
    setShowError(false);
    setErrorMessage("");
  };

  const getStatusColor = (status) => {
    if (status === "confirmed" || status === "active")
      return { bg: "#dcfce7", text: "#166534", dot: "#22c55e" };
    if (status === "pending")
      return { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" };
    return { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" };
  };

  // ✅ Duplicate cards for seamless infinite scroll loop
  const displayBookings =
    todayBookings.length > 0
      ? [...todayBookings, ...todayBookings]
      : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-28 px-6 relative">
        {/* Booking Form */}
        <div
          className={`max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 ${
            showError ? "blur-sm pointer-events-none" : ""
          }`}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Book Venue</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="w-full bg-[#7a1c2e] text-white py-3 rounded-lg font-semibold hover:bg-[#8e303f] transition disabled:bg-gray-400"
            >
              {isChecking ? "Checking..." : "Check Availability"}
            </button>
          </div>
        </div>

        {/* ── Live Bookings Ticker ── */}
        <div
          className={`max-w-2xl mx-auto mt-6 transition-all duration-300 ${
            showError ? "blur-sm pointer-events-none" : ""
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-widest">
              Live Today's Bookings
            </span>
            {!loadingBookings && (
              <span className="ml-auto text-xs text-gray-400 font-medium">
                {todayBookings.length} booking{todayBookings.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Scroll Container */}
          <div
            className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-100"
            style={{ position: "relative" }}
          >
            {/* Fade edges */}
            <div
              className="absolute left-0 top-0 h-full w-12 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, white, transparent)" }}
            />
            <div
              className="absolute right-0 top-0 h-full w-12 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, white, transparent)" }}
            />

            {loadingBookings ? (
              <div className="flex items-center justify-center py-6 gap-2 text-gray-400 text-sm">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading today's bookings...
              </div>
            ) : todayBookings.length === 0 ? (
              <div className="flex items-center justify-center py-6 gap-2 text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                No bookings scheduled for today
              </div>
            ) : (
              <div className="py-4 px-2">
                <div
                  ref={scrollRef}
                  className="flex gap-4 will-change-transform"
                  style={{ width: "max-content" }}
                  onMouseEnter={() => { isPausedRef.current = true; }}
                  onMouseLeave={() => { isPausedRef.current = false; }}
                >
                  {displayBookings.map((booking, idx) => {
                    const colors = getStatusColor(booking.status);
                    return (
                      <div
                        key={`${booking._id}-${idx}`}
                        className="shrink-0 rounded-xl border px-5 py-3.5 cursor-default select-none"
                        style={{
                          minWidth: "220px",
                          background: colors.bg,
                          borderColor: colors.dot + "55",
                          boxShadow: `0 2px 8px ${colors.dot}22`,
                        }}
                      >
                        {/* Venue name */}
                        <div
                          className="font-semibold text-gray-800 text-sm truncate mb-1"
                          style={{ maxWidth: "180px" }}
                        >
                          {booking.venue?.name || booking.venueId?.name || "Venue"}
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {booking.startTime} – {booking.endTime}
                        </div>

                        {/* User + Status row */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className="flex items-center gap-1.5 text-xs text-gray-500 truncate"
                            style={{ maxWidth: "120px" }}
                          >
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="truncate">
                              {booking.user?.name || booking.userId?.name || "User"}
                            </span>
                          </div>
                          <span
                            className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: colors.dot + "22", color: colors.text }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ background: colors.dot }}
                            />
                            {booking.status || "pending"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center mt-2">
            Hover to pause • Auto-refreshes every minute
          </p>
        </div>

        {/* Error Modal */}
        {showError && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            onClick={closeError}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideDown"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
                Invalid Time Selection
              </h3>
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                {errorMessage}
              </p>
              <button
                onClick={closeError}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideDown {
            from { transform: translateY(-50px); opacity: 0; }
            to   { transform: translateY(0);     opacity: 1; }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}

export default BookingPage;