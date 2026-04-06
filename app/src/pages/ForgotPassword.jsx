import { useState } from "react";
import { forgotPassword } from "../api/auth";
import { useNavigate } from "react-router-dom";
import CollegeHeader from "../components/CollegeHeader";

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
    <div className="flex flex-col min-h-screen">

      <CollegeHeader
        logoSrc="/public/images/its-logo.png"
      />

    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-10 rounded-3xl w-full max-w-md shadow-xl border-t-4 border-[#9a031e]">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#9a031e]">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-4 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#9a031e]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            className="w-full bg-[#9a031e] text-white p-4 rounded-lg font-semibold hover:bg-[#7d0219] transition"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-[#9a031e]">{message}</p>
        )}
      </div>
    </div>
    </div>
  );
}

export default ForgotPassword;