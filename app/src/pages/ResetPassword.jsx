import { useState } from "react";
import { resetPassword } from "../api/auth";
import { useLocation, useNavigate } from "react-router-dom";
import CollegeHeader from "../components/CollegeHeader";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const emailFromURL = query.get("email");

  const [form, setForm] = useState({
    email: emailFromURL || "",
    otp: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);

  // Countdown timer
  useState(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await resetPassword(form);
      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      <CollegeHeader
        logoSrc="/public/images/its-logo.png"
      />

    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-10 rounded-3xl w-full max-w-md shadow-xl border-t-4 border-[#9a031e]">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#9a031e]">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            value={form.email}
            className="w-full p-4 mb-3 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9a031e]"
            readOnly
          />

          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            className="w-full p-4 mb-3 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9a031e]"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            className="w-full p-4 mb-4 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9a031e]"
            onChange={handleChange}
            required
          />

          <button
            className="w-full bg-[#9a031e] text-white p-4 rounded-lg font-semibold hover:bg-[#7d0219] transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-[#9a031e]">{message}</p>
        )}

        <p className="text-center text-xs mt-3 text-gray-400">
          OTP expires in {timer}s
        </p>

        <p className="text-center text-sm mt-4">
          <button
            className="text-[#9a031e] hover:underline"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
    </div>
  );
}

export default ResetPassword;