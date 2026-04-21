import { useState } from "react";
import axios from "../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { useAuth } from "../components/AuthContext";
import CollegeHeader from "../components/CollegeHeader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
  e.preventDefault();
  
  if (!email || !password) {
    setError("All fields are required");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError("Enter a valid email");
    return;
  }

  setError("");
  setLoading(true);

  try {
  const res = await axios.post("/auth/login", { email, password });
  const user = res.data?.data?.user;
  login(user);

  if (user?.role === 'admin') {
    navigate('/admin');
  } else if (user?.role === 'user') {
    navigate('/user');
  } else {
    navigate('/dashboard');
  }
} catch (err) {
  setError(err.response?.data?.message || "Invalid email or password");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="flex flex-col min-h-screen">

      <CollegeHeader
        logoSrc="/public/images/its-logo.png"
      />

    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center mb-6 text-[#9a031e]">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-right text-sm mt-2">
            <Link 
              to="/forgot-password" 
              className="text-[#9a031e] hover:opacity-80 transition"
            >
              Forgot Password?
            </Link>
          </p>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button text={loading ? "Logging in..." : "Login"} disabled={loading} />
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#9a031e] font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
    </div>
  );
}