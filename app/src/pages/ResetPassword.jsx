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
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  return (
    <div className="flex flex-col min-h-screen">

      <CollegeHeader
        logoSrc="/images/its-logo.png"
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

          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              className="w-full p-4 pr-12 mb-4 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9a031e]"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#9a031e]"
            >
              <EyeIcon show={showNewPassword} />
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              className="w-full p-4 pr-12 mb-4 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9a031e]"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#9a031e]"
            >
              <EyeIcon show={showConfirmPassword} />
            </button>
          </div>

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
