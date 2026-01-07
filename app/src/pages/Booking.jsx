import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAvailability } from "../api/bookingApi";

function BookingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  
  const [isChecking, setIsChecking] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

    // Combine date and time to create full datetime
    const selectedStartDateTime = new Date(`${date}T${startTime}`);
    const selectedEndDateTime = new Date(`${date}T${endTime}`);
    const currentDateTime = new Date();

    // Check if start time is in the past
    if (selectedStartDateTime <= currentDateTime) {
      setErrorMessage("The selected start time has already passed. Please choose a future time for your booking.");
      setShowError(true);
      return false;
    }

    // Check if end time is before start time
    if (selectedEndDateTime <= selectedStartDateTime) {
      setErrorMessage("End time must be after start time. Please adjust your booking times.");
      setShowError(true);
      return false;
    }

    return true;
  };

  const handleCheck = async () => {
    const { date, startTime, endTime } = formData;

    if (!validateTime()) {
      return;
    }

    setIsChecking(true);

    try {
      const response = await checkAvailability(
        formData.date,
        formData.startTime,
        formData.endTime
      );

      console.log("BACKEND RESPONSE:", response.data);

      navigate("/available-venues", {
        state: {
          availableVenues: response.data.data.availableVenues,
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

  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-6 relative">
      <div className={`max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 ${showError ? 'blur-sm pointer-events-none' : ''}`}>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Book Venue</h2>

        <div className="space-y-4">
          {/* Event Date */}
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

          {/* Time Range */}
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

          {/* Check Availability Button */}
          <button
            onClick={handleCheck}
            disabled={isChecking}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isChecking ? "Checking..." : "Check Availability"}
          </button>
        </div>
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
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Error Title */}
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
              Invalid Time Selection
            </h3>

            {/* Error Message */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              {errorMessage}
            </p>

            {/* Close Button */}
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
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default BookingPage;