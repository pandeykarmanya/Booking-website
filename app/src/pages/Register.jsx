import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerUser } from "../api/auth";
import CollegeHeader from "../components/CollegeHeader";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [formError, setFormError] = useState("");
  const [otpError, setOtpError] = useState("");

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------------- REGISTER ---------------- */
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setFormError("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setFormError("Enter a valid email");
      return;
    }

    if (form.password !== form.confirm) {
      setFormError("Passwords do not match");
      return;
    }

    setFormError("");
    setLoading(true);

    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // ✅ open OTP modal only after success
      setOtp("");
      setOtpError("");
      setShowOTPModal(true);

    } catch (err) {
      setFormError(
        err.response?.data?.message || "Account already exists"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setOtpError("Enter valid 6-digit OTP");
      return;
    }

    setOtpError("");
    setOtpLoading(true);

    try {
  // 🔹 Step 1: Verify OTP
  await axios.post("http://localhost:5001/api/v1/auth/verify-otp", {
    email: form.email,
    otp,
  });

  // 🔹 Step 2: Auto login
  const loginRes = await axios.post(
    "http://localhost:5001/api/v1/auth/login",
    {
      email: form.email,
      password: form.password, // 👈 IMPORTANT
    },
    {
      withCredentials: true, // 👈 REQUIRED for cookies
    }
  );

  console.log("Login Success:", loginRes.data);

  alert("Account verified & logged in ✅");

  setShowOTPModal(false);
  setOtp("");

  // 🔹 Step 3: Redirect
  navigate("/user"); 

} catch (err) {
  setOtpError(err.response?.data?.message || "Invalid OTP");
} finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      <CollegeHeader
        logoSrc="/public/images/its-logo.png"
      />

    <div className="relative flex items-center justify-center min-h-screen">

      {/* Register Box */}
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center mb-6 text-[#9a031e]">
          Register
        </h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <InputField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
          <InputField
            label="Confirm Password"
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
          />

          {formError && (
            <p className="text-red-600 text-sm">{formError}</p>
          )}

          <Button text={loading ? "Registering..." : "Register"} />
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-[#9a031e] font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>

      {/* OTP MODAL */}
      {showOTPModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl w-80 shadow-xl text-center">

            <h2 className="text-xl font-semibold mb-4 text-[#9a031e]">
              Verify OTP
            </h2>

            <p className="text-sm text-gray-500 mb-3">
              OTP sent to {form.email}
            </p>

            <input
              type="text"
              value={otp}
              autoFocus
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 6) setOtp(value);
              }}
              placeholder="Enter 6-digit OTP"
              className="w-full border p-2 rounded-lg text-center tracking-widest mb-4"
            />

            {otpError && (
              <p className="text-red-500 text-sm mb-2">{otpError}</p>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={otpLoading}
              className="w-full bg-[#9a031e] text-white py-2 rounded-lg mb-2"
            >
              {otpLoading ? "Verifying..." : "Verify"}
            </button>

            <button
              onClick={() => setShowOTPModal(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
    </div>
  );
}