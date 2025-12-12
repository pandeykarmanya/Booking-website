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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheck = async () => {
  const { date, startTime, endTime } = formData;

  if (!date || !startTime || !endTime) {
    alert("Please select date, start time, and end time");
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
        availableVenues: response.data.message.availableVenues,
        bookingDetails: formData,
      },
    });

  } catch (error) {
    console.error("Error checking availability:", error);
  } finally {
    setIsChecking(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 pt-28 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
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
    </div>
  );
}

export default BookingPage;