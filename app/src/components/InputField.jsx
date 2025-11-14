import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  name,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <div className="relative flex items-center">
        <input
          type={inputType}
          name={name}
          value={value}
          required={required}
          onChange={onChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#9a031e]/70 focus:outline-none pr-10"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-gray-500 hover:text-[#9a031e] flex items-center justify-center"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
