import { useState, useRef, useEffect } from "react";
import { User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-transparent z-50">
      <div className="max-w-6xl mx-auto px-6 py-3">
        {/* Inner red transparent div */}
        <div className="bg-gradient-to-r from-[rgba(120,2,24,0.6)] to-[rgba(154,3,30,0.5)] backdrop-blur-md rounded-full shadow-md flex justify-between items-center px-6 py-3 text-white">
          {/* Left Logo */}
          <Link
            to="/"
            className="text-2xl font-bold hover:opacity-90 transition-opacity"
          >
            Booking
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex space-x-6 font-medium">
            <li>
              <Link to="/user" className="hover:text-gray-200 transition">
                Booking
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gray-200 transition">
                Occupied
              </Link>
            </li>
          </ul>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Profile Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Profile</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-2">
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 rounded hover:bg-red-100"
                    onClick={() => alert('Logout clicked')}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 bg-[rgba(154,3,30,0.3)] backdrop-blur-md rounded-2xl text-white shadow-lg py-4 space-y-3 text-center">
            <Link to="/user" onClick={() => setMenuOpen(false)} className="block hover:text-gray-200">
              Booking
            </Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="block hover:text-gray-200">
              Occupied
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
