import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Menu, X } from "lucide-react";
import axios from "../api/axiosInstance";
import { logoutUser } from "../api/auth";
import AdminNavbar from "../components/AdminNavbar";

export default function AddVenue() {
  const [name, setName] = useState("");
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings"); 
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchVenues = async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get("/venues");
      const data = res.data?.data || res.data?.venues || res.data || [];
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching venues:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await axios.post("/venues", { name });
      setSuccess("Venue added successfully");
      setName("");
      fetchVenues();
    } catch (err) {
      setError(err.response?.data?.message || "Error adding venue");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50">

      <AdminNavbar activeTab={activeTab} />

      {/* ── Content ── */}
      <div className="pt-28 px-6 pb-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#9a031e] mb-8">Venue Management</h1>

        {/* Add Venue Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Add New Venue</h2>
          <p className="text-sm text-gray-500 mb-6">Fill in the details to register a new venue.</p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter venue name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9a031e]/30 focus:border-[#9a031e] transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#9a031e] text-white rounded-xl text-sm font-medium hover:bg-[#7a0118] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Venue"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="mt-4 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">{success}</p>
          )}
        </div>

        {/* Venues List Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">All Venues</h2>
              <p className="text-sm text-gray-500 mt-1">
                {venues.length} venue{venues.length !== 1 ? "s" : ""} registered
              </p>
            </div>
            <button
              onClick={fetchVenues}
              className="text-sm text-[#9a031e] hover:underline"
            >
              Refresh
            </button>
          </div>

          {fetchLoading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading venues...</div>
          ) : venues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No venues added yet.</p>
              <p className="text-gray-300 text-xs mt-1">Add your first venue above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {venues.map((venue, index) => (
                <div
                  key={venue._id || index}
                  className="flex items-center gap-4 border border-gray-100 rounded-xl px-5 py-4 hover:shadow-sm transition"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f3e8eb] flex items-center justify-center text-[#9a031e] font-bold text-sm flex-shrink-0">
                    {venue.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{venue.name}</p>
                    <p className="text-xs text-gray-400">Venue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}