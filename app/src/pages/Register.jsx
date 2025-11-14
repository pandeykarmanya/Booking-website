import { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Enter a valid email");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    alert("Registration Successful (connect backend next)");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
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

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button text="Register" />
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#9a031e] font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
