import { useState } from "react";
import { forgotPassword } from "../api/auth";
import { useNavigate } from "react-router-dom";
import CollegeHeader from "../components/CollegeHeader";
import Footer from "../components/Footer";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await forgotPassword(email);
      setMessage(res.data.message);

      setTimeout(() => {
        navigate(`/reset-password?email=${email}`);
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">

      <CollegeHeader logoSrc="/images/its-logo.png" />

      <div className="flex flex-1 items-center justify-center px-4">
        
        <div className="w-full max-w-md backdrop-blur-xl bg-white/60 border border-white/30 shadow-2xl rounded-3xl p-8 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          
          <h2 className="text-3xl font-bold text-center text-[#7a1c2e] mb-2">
            Forgot Password
          </h2>
          <p className="text-center text-gray-600 text-sm mb-6">
            Enter your email to receive OTP
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-4 rounded-xl bg-white/80 border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9a031e] focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full bg-[#7a1c2e] text-white p-4 rounded-xl font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm text-[#9a031e] animate-fadeIn">
              {message}
            </p>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}

export default ForgotPassword;