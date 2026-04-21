// src/pages/AvailableVenues.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../api/bookingApi";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Clock,
  CheckCircle
} from "lucide-react";

function AvailableVenues() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isBooking, setIsBooking] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const { availableVenues = [], allVenues = [], bookingDetails = {} } = location.state || {};

  // ✅ Set of available venue IDs for quick lookup
  const availableIds = new Set(availableVenues.map((v) => v._id || v.id));

  // Use allVenues if available, otherwise fall back to availableVenues
  const venuesToShow = allVenues.length > 0 ? allVenues : availableVenues;

  // 🔐 Safety: redirect if page opened directly
  useEffect(() => {
    if (!location.state && !successMessage) {
      navigate("/booking", { replace: true });
    }
  }, [location.state, navigate, successMessage]);

  const handleBook = async (venue) => {
    setIsBooking(true);
    setSuccessMessage("");
    setRedirecting(false);

    try {
      await createBooking({
        venue: venue._id || venue.id,
        date: bookingDetails.date,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime
      });

      setSuccessMessage("🎉 Booking completed successfully!");
      setRedirecting(true);

      setTimeout(() => {
        navigate("/user");
      }, 3000);

    } catch (error) {
      setSuccessMessage("❌ Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-6">
      <div className="max-w-4xl mx-auto">

        {/* 🔙 Back */}
        <button
          onClick={() => navigate("/booking")}
          className="flex items-center gap-2 text-[#7a1c2e] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </button>

        {/* ✅ SUCCESS MESSAGE */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-300 text-green-800 px-5 py-4 rounded-xl font-semibold">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p>{successMessage}</p>
              {redirecting && (
                <p className="text-sm mt-1 text-green-700">
                  Redirecting to dashboard...
                </p>
              )}
            </div>
          </div>
        )}

        {/* 📋 BOOKING DETAILS */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Booking Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Detail icon={<Calendar />} label="Date">
              {new Date(bookingDetails.date).toLocaleDateString()}
            </Detail>
            <Detail icon={<Clock />} label="Start Time">
              {bookingDetails.startTime}
            </Detail>
            <Detail icon={<Clock />} label="End Time">
              {bookingDetails.endTime}
            </Detail>
          </div>
        </div>

        {/* 🏛️ ALL VENUES */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">
            All Venues &nbsp;
            <span className="text-green-600 font-medium text-base">
              ({availableVenues.length} available
            </span>
            <span className="text-gray-400 font-normal text-base">
              &nbsp;of {venuesToShow.length})
            </span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {venuesToShow.map((venue) => {
              const isAvailable = allVenues.length > 0
                ? availableIds.has(venue._id || venue.id)
                : true; // if no allVenues, all shown are available

              return (
                <div
                  key={venue._id || venue.id}
                  className={`border p-5 rounded-xl transition ${
                    isAvailable ? "" : "opacity-50 bg-gray-50"
                  }`}
                >
                  {/* Name + Badge */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{venue.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {isAvailable ? "✓ Available" : "✗ Unavailable"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 flex gap-2 mt-2">
                    <Users className="w-4 h-4" />
                    Capacity: {venue.capacity}
                  </p>

                  {venue.location && (
                    <p className="text-sm text-gray-600 flex gap-2 mt-2">
                      <MapPin className="w-4 h-4" />
                      {venue.location}
                    </p>
                  )}

                  <button
                    disabled={!isAvailable || isBooking}
                    onClick={() => isAvailable && handleBook(venue)}
                    className={`w-full mt-4 py-2 rounded-lg font-semibold transition ${
                      isAvailable
                        ? "bg-[#7a1c2e] text-white hover:bg-[#8e303f]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {!isAvailable
                      ? "Already Booked"
                      : isBooking
                      ? "Booking..."
                      : "Book Venue"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

/* 🔁 Reusable detail component */
function Detail({ icon, label, children }) {
  return (
    <div className="flex gap-3 items-center">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold">{children}</p>
      </div>
    </div>
  );
}

export default AvailableVenues;