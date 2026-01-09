import { useState, useEffect } from "react";
import { TrendingUp, Ticket, X } from "lucide-react";
import Navbar from "../components/Navbar";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [user, setUser] = useState(null);

  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  /* ------------------ HELPERS ------------------ */
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0].toUpperCase())
      .join("");
  };

  /* ------------------ FETCH USER ------------------ */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/v1/user/me", {
          credentials: "include",
        });

        const data = await res.json();

        if (data.success && data.data) {
          setUser(data.data);
        }
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    fetchUser();
  }, []);

  /* ------------------ FETCH BOOKINGS ------------------ */
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          "http://localhost:5001/api/v1/booking/my-bookings",
          { credentials: "include" }
        );

        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          const now = new Date();
          const upcoming = [];
          const past = [];

          data.data.forEach((b) => {
            if (!b.date || !b.endTime) return;

            // ✅ Correct date + time handling
            const bookingEnd = new Date(b.date);
            const [endHour, endMinute] = b.endTime.split(":");
            bookingEnd.setHours(endHour, endMinute, 0, 0);

            if (bookingEnd >= now) {
              upcoming.push(b);
            } else {
              past.push(b);
            }
          });

          setUpcomingBookings(upcoming);
          setPastBookings(past);

          console.log("UPCOMING FINAL:", upcoming);
          console.log("PAST FINAL:", past);
        }
      } catch (err) {
        console.error("Booking fetch error:", err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  /* ------------------ UI ------------------ */
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
              <p className="text-gray-500">
                Email: {user?.email || "Not Available"}
              </p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            label="Total Bookings"
            value={upcomingBookings.length + pastBookings.length}
            icon={<Ticket />}
          />
          <StatCard
            label="Upcoming"
            value={upcomingBookings.length}
            icon={<TrendingUp />}
          />
          <StatCard label="Past" value={pastBookings.length} icon={<X />} />
        </div>

        {/* BOOKINGS */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">My Bookings</h3>

          {/* TABS */}
          <div className="flex space-x-6 border-b mb-6">
            {["upcoming", "past"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {tab === "upcoming" ? "Upcoming" : "Past Events"}
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
                <BookingCard key={b._id} booking={b} />
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
    </div>
  );
}

/* ------------------ COMPONENTS ------------------ */

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
      <div>
        <p className="text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className="text-blue-600 w-8 h-8">{icon}</div>
    </div>
  );
}

function BookingCard({ booking, past }) {
  return (
    <div className="border rounded-xl p-4 mb-4 flex justify-between items-center">
      <div>
        <h4 className="font-semibold">
          {booking.venue?.name || "Venue not found"}
        </h4>
        <p className="text-sm text-gray-500">
          {new Date(booking.date).toLocaleDateString()} •{" "}
          {booking.startTime} - {booking.endTime}
        </p>
      </div>

      <span
        className={`px-3 py-1 text-xs rounded-full ${
          past
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {past ? "Completed" : "Upcoming"}
      </span>
    </div>
  );
}

function Empty({ text }) {
  return <div className="text-center text-gray-400 py-10">{text}</div>;
}