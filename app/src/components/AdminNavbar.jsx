// components/AdminNavbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Menu, X } from "lucide-react";
import { logoutUser } from "../api/auth";

export default function AdminNavbar({ activeTab, setActiveTab }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="bg-gradient-to-r from-[rgba(120,2,24,0.6)] to-[rgba(154,3,30,0.5)] backdrop-blur-md rounded-full shadow-md flex justify-between items-center px-6 py-3 text-white">
          <Link to="/">
            <img
              src="./images/its-logo.png"
              alt="ITS Logo"
              className="w-12 h-12 rounded-full object-contain bg-white p-1 border-2 border-white/60"
            />
          </Link>

          <ul className="hidden md:flex space-x-6 font-medium">
            <li>
              <button
                onClick={() => { navigate("/admin"); setActiveTab?.("bookings"); }}
                className={`hover:text-gray-200 ${activeTab === "bookings" ? "underline font-semibold" : ""}`}
              >
                Bookings
              </button>
            </li>
            <li>
              <button
                onClick={() => { navigate("/admin"); setActiveTab?.("users"); }}
                className={`hover:text-gray-200 ${activeTab === "users" ? "underline font-semibold" : ""}`}
              >
                Users
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/admin/add-venue")}
                className={`hover:text-gray-200 ${activeTab === "venues" ? "underline font-semibold" : ""}`}
              >
                Venues
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/admin/upcoming-bookings")}
                className={`hover:text-gray-200 ${activeTab === "venues" ? "underline font-semibold" : ""}`}
              >
                Pre-Bookings
              </button>
            </li>
          </ul>

          <div className="flex items-center gap-3">
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
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-3 bg-[rgba(154,3,30,0.3)] backdrop-blur-md rounded-2xl text-white shadow-lg py-4 space-y-3 text-center">
            <button onClick={() => { navigate("/admin"); setActiveTab?.("bookings"); setMenuOpen(false); }} className="block w-full hover:text-gray-200 py-2">
              Bookings
            </button>
            <button onClick={() => { navigate("/admin"); setActiveTab?.("users"); setMenuOpen(false); }} className="block w-full hover:text-gray-200 py-2">
              Users
            </button>
              <button onClick={() => navigate("/admin/add-venue")} className="block w-full hover:text-gray-200 py-2">
                Venues
              </button>
              <button onClick={() => navigate("/admin/upcoming-bookings")} className="block w-full hover:text-gray-200 py-2">
                Pre-Bookings
              </button>

          </div>
        )}
      </div>
    </nav>
  );
}