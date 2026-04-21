import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerUser } from "../api/auth";
import CollegeHeader from "../components/CollegeHeader";
import Footer from "../components/Footer";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) { setFormError("All fields are required"); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { setFormError("Enter a valid email"); return; }
    if (form.password !== form.confirm) { setFormError("Passwords do not match"); return; }
    setFormError(""); setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      setOtp(""); setOtpError(""); setShowOTPModal(true);
    } catch (err) {
      setFormError(err.response?.data?.message || "Account already exists");
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setOtpError("Enter valid 6-digit OTP"); return; }
    setOtpError(""); setOtpLoading(true);
    try {
      await axios.post("http://localhost:5001/api/v1/auth/verify-otp", { email: form.email, otp });
      await axios.post("http://localhost:5001/api/v1/auth/login", { email: form.email, password: form.password }, { withCredentials: true });
      setShowOTPModal(false); navigate("/user");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
    } finally { setOtpLoading(false); }
  };

  const EyeIcon = ({ show }) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      {show ? (<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>) : (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)}
    </svg>
  );

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7a1c2e]/20 focus:border-[#7a1c2e] transition";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <CollegeHeader logoSrc="/public/images/its-logo.png" />

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 w-full max-w-md">

          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-[#7a1c2e] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">ITS Ghaziabad</p>
              <p className="text-xs text-gray-400">Venue Booking Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Create account</h2>
          <p className="text-sm text-gray-400 mb-7">Register to start booking venues</p>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-5">
              {formError}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Full name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Karmanya Pandey" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@its.edu.in" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="••••••••" className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon show={showPass} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Confirm password</label>
              <div className="relative">
                <input name="confirm" type={showConfirm ? "text" : "password"} value={form.confirm} onChange={handleChange} placeholder="••••••••" className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#7a1c2e] hover:bg-[#8e303f] text-white py-2.5 rounded-lg text-sm font-medium transition disabled:bg-gray-300 mt-1">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300">already registered?</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <p className="text-sm text-center text-gray-500">
            Have an account? <Link to="/" className="text-[#7a1c2e] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <Footer />

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#7a1c2e]/08 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#7a1c2e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Verify your email</h3>
            <p className="text-sm text-gray-400 mb-5">OTP sent to {form.email}</p>

            <input
              type="text" value={otp} autoFocus
              onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 6) setOtp(v); }}
              placeholder="000000"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xl font-semibold tracking-[0.5rem] text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7a1c2e]/20 focus:border-[#7a1c2e] transition mb-4"
            />

            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">{otpError}</div>
            )}

            <button onClick={handleVerifyOTP} disabled={otpLoading}
              className="w-full bg-[#7a1c2e] hover:bg-[#8e303f] text-white py-2.5 rounded-lg text-sm font-medium transition disabled:bg-gray-300 mb-3">
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>
            <button onClick={() => setShowOTPModal(false)} className="text-sm text-gray-400 hover:text-gray-600 hover:underline">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}