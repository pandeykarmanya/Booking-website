import { useState, useRef, useEffect } from "react";
import { Users, Menu, X, Calendar, Shield, XCircle, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import BookingFilterDownload from "../components/Bookingfilterdownload";
import axios from "../api/axiosInstance";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelError, setCancelError] = useState("");

  // Make Admin modal state
  const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [makeAdminError, setMakeAdminError] = useState("");
  const [makeAdminSuccess, setMakeAdminSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getBookingStatus = (booking) => {
    if (booking.status === "cancelled") return "cancelled";

    try {
      const now = new Date();
      const bookingDate = new Date(booking.date);
      
      let startTime = booking.startTime;
      let endTime = booking.endTime;
      if (!startTime || !endTime) return 'upcoming';
      
      let [startHours, startMinutes] = startTime.split(':');
      if (startTime.toLowerCase().includes('pm') && parseInt(startHours) !== 12) {
        startHours = parseInt(startHours) + 12;
      } else if (startTime.toLowerCase().includes('am') && parseInt(startHours) === 12) {
        startHours = 0;
      }
      
      let [endHours, endMinutes] = endTime.split(':');
      if (endTime.toLowerCase().includes('pm') && parseInt(endHours) !== 12) {
        endHours = parseInt(endHours) + 12;
      } else if (endTime.toLowerCase().includes('am') && parseInt(endHours) === 12) {
        endHours = 0;
      }
      
      const bookingStartTime = new Date(bookingDate);
      bookingStartTime.setHours(parseInt(startHours), parseInt(startMinutes) || 0, 0, 0);
      
      const bookingEndTime = new Date(bookingDate);
      bookingEndTime.setHours(parseInt(endHours), parseInt(endMinutes) || 0, 0, 0);
      
      if (now < bookingStartTime) {
        return 'upcoming';
      } else if (now >= bookingStartTime && now <= bookingEndTime) {
        return 'in-progress';
      } else {
        return 'done';
      }
    } catch (error) {
      console.error("Error checking booking time:", error);
      return 'upcoming';
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeTab === "bookings") fetchBookings();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "stats") fetchStats();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/booking/all");
      const bookingsData = Array.isArray(response.data)
        ? response.data
        : response.data.bookings || response.data.data || [];
      setBookings(bookingsData);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      alert("Failed to fetch bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users/all");
      const allUsers =
        res.data?.data?.users ||
        res.data?.users ||
        res.data?.data ||
        [];
      const regularUsers = allUsers.filter((user) => user.role !== "admin");
      setUsers(regularUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Cancel Booking ---
  const handleCancelBooking = async () => {
    try {
      await axios.patch(`/booking/cancel/${selectedBookingId}`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBookingId ? { ...b, status: "cancelled" } : b
        )
      );
      closeCancelModal();
    } catch (err) {
      setCancelError(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedBookingId(null);
    setCancelError("");
  };

  // --- Make Admin ---
  const openMakeAdminModal = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setMakeAdminError("");
    setMakeAdminSuccess("");
    setShowMakeAdminModal(true);
  };

  const closeMakeAdminModal = () => {
    setShowMakeAdminModal(false);
    setSelectedUserId(null);
    setSelectedUserName("");
    setMakeAdminError("");
    setMakeAdminSuccess("");
  };

  const handleMakeAdmin = async () => {
    try {
      await axios.patch(`/users/${selectedUserId}/make-admin`);
      setUsers(users.filter((user) => user._id !== selectedUserId));
      setMakeAdminSuccess(`${selectedUserName} has been promoted to admin successfully!`);
    } catch (err) {
      console.error("Error promoting user:", err);
      setMakeAdminError(err.response?.data?.message || "Failed to promote user");
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
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-8 max-w-7xl mx-auto">
        
        {activeTab === "bookings" && (
          <section>
            <BookingFilterDownload />
            <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#9a031e]" />
              All Bookings ({bookings.length})
            </h2>

            {loading ? (
              <div className="bg-white shadow rounded-lg p-12 text-center">
                <p className="text-gray-500">Loading bookings...</p>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-center p-8">No bookings found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                      <tr className="bg-[#f3e8eb] text-[#7a1c2e]">
                        <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Venue</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Action</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
  {bookings.map((booking) => {
    const bookingStatus = getBookingStatus(booking);

    return (
      <tr key={booking._id} className="hover:bg-gray-50 transition">

        {/* DATE */}
        <td className="px-6 py-4 text-sm text-gray-700">
          {formatDate(booking.date)}
        </td>

        {/* USER */}
        <td className="px-6 py-4 text-sm font-medium text-gray-800">
          {booking.userId?.name || booking.user?.name || 'N/A'}
        </td>

        {/* VENUE */}
        <td className="px-6 py-4 text-sm text-gray-700">
          {booking.venueId?.name || booking.venue?.name || booking.venueName || 'N/A'}
        </td>

        {/* TIME */}
        <td className="px-6 py-4 text-sm text-gray-600">
          {booking.startTime && booking.endTime
            ? `${booking.startTime} - ${booking.endTime}`
            : booking.timeSlot || 'N/A'}
        </td>

        {/* STATUS */}
        <td className="px-6 py-4 text-sm">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              booking.status === 'confirmed' || booking.status === 'active'
                ? 'bg-green-100 text-green-700'
                : booking.status === 'cancelled'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {booking.status || 'Pending'}
          </span>
        </td>

        {/* ACTION */}
        <td className="px-6 py-4 text-center">
          {bookingStatus === "cancelled" ? (
            <span className="text-red-600 text-sm italic">Cancelled</span>
          ) : bookingStatus === "upcoming" ? (
            <button
              className="text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg transition text-sm"
              onClick={() => {
                setSelectedBookingId(booking._id);
                setShowCancelModal(true);
              }}
            >
              Cancel
            </button>
          ) : bookingStatus === "in-progress" ? (
            <span className="text-blue-600 text-sm italic">In Progress</span>
          ) : (
            <span className="text-green-600 text-sm italic">Done</span>
          )}
        </td>

      </tr>
    );
  })}
</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "users" && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#9a031e]" />
              Manage Users ({users.length})
            </h2>

            {loading ? (
              <div className="bg-white shadow rounded-lg p-12 text-center">
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-center p-8">No users found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                              {user.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.email || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                className="inline-flex items-center gap-1 text-green-700 hover:text-white hover:bg-green-600 px-3 py-2 rounded-lg transition font-medium text-sm"
                                onClick={() => openMakeAdminModal(user._id, user.name)}
                              >
                                <Shield className="w-4 h-4" />
                                Make Admin
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        
      </div>

      {/* ── Cancel Booking Modal ── */}
      {showCancelModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/30"
          onClick={closeCancelModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">Cancel Booking</h3>
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              Are you sure you want to cancel this booking?<br />This action cannot be undone.
            </p>
            {cancelError && (
              <p className="text-red-600 text-center text-sm mb-4">{cancelError}</p>
            )}
            <div className="flex gap-4">
              <button
                onClick={closeCancelModal}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                onClick={handleCancelBooking}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Make Admin Modal ── */}
      {showMakeAdminModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/30"
          onClick={() => { if (!makeAdminSuccess) closeMakeAdminModal(); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            {makeAdminSuccess ? (
              /* ── Success State ── */
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
                  Promotion Successful!
                </h3>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  {makeAdminSuccess}
                </p>
                <button
                  onClick={closeMakeAdminModal}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Done
                </button>
              </>
            ) : (
              /* ── Confirm State ── */
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
                  Promote to Admin
                </h3>
                <p className="text-gray-600 text-center mb-1 leading-relaxed">
                  Are you sure you want to promote
                </p>
                <p className="text-[#9a031e] font-semibold text-center text-lg mb-1">
                  {selectedUserName}
                </p>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  to admin? They will have full admin access.
                </p>
                {makeAdminError && (
                  <p className="text-red-600 text-center text-sm mb-4">{makeAdminError}</p>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={closeMakeAdminModal}
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMakeAdmin}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                  >
                    Yes, Promote
                  </button>
                </div>
              </>
            )}
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
  );
}
