import { useEffect, useState } from "react";

function Booking() {
  const [showTimeModal, setShowTimeModal] = useState(true);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [available, setAvailable] = useState([]);
  const [booked, setBooked] = useState([]);

  const [loading, setLoading] = useState(false);

  // Fetch available auditoriums
  const fetchAvailableAuditoriums = async () => {
    if (!startTime || !endTime) {
      alert("Please select both times");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/v1/auditoriums/available?start=${startTime}&end=${endTime}`
      );

      const data = await res.json();

      setAvailable(data.available || []);
      setBooked(data.booked || []);

      setShowTimeModal(false);
    } catch (err) {
      console.error("Fetch error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/20 to-primary/5 p-8">

      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Book an Auditorium</h1>

      {/* ---------- TIME MODAL ---------- */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-5 text-center">
              Select Time Slot
            </h2>

            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              className="w-full border p-2 rounded mb-4"
              onChange={(e) => setStartTime(e.target.value)}
            />

            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="time"
              className="w-full border p-2 rounded mb-4"
              onChange={(e) => setEndTime(e.target.value)}
            />

            <button
              onClick={fetchAvailableAuditoriums}
              className="w-full bg-primary text-white p-2 rounded-lg mt-2"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* ---------- LOADING ---------- */}
      {loading && (
        <p className="text-lg font-medium text-gray-700 mt-6">Loading...</p>
      )}

      {/* ---------- DISPLAY RESULTS ---------- */}
      {!loading && !showTimeModal && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* AVAILABLE */}
          {available.length > 0 && (
            <>
              <h2 className="col-span-full text-2xl font-semibold">
                Available Auditoriums
              </h2>

              {available.map((a) => (
                <div
                  key={a.id}
                  className="p-6 bg-green-200 border border-green-500 rounded-2xl shadow cursor-pointer hover:scale-105 transition"
                >
                  <h3 className="text-lg font-bold">{a.name}</h3>
                  <p className="text-sm mt-1">Available</p>
                </div>
              ))}
            </>
          )}

          {/* BOOKED */}
          {booked.length > 0 && (
            <>
              <h2 className="col-span-full text-2xl font-semibold mt-8">
                Already Booked
              </h2>

              {booked.map((b) => (
                <div
                  key={b.id}
                  className="p-6 bg-red-200 border border-red-500 rounded-2xl shadow"
                >
                  <h3 className="text-lg font-bold">{b.name}</h3>
                  <p className="text-sm mt-1">
                    Booked from {b.start} to {b.end}
                  </p>
                </div>
              ))}
            </>
          )}

          {/* NO DATA */}
          {available.length === 0 && booked.length === 0 && (
            <p className="col-span-full text-center text-gray-600 text-lg">
              No auditoriums found for this time slot.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Booking;