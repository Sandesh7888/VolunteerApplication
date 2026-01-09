import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "VOLUNTEER",
    number: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        throw new Error("Registration failed or email already exists");
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md border">
        {/* Fixed Title - Blue Gradient */}
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join us today
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 mb-3 rounded-xl">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fixed Inputs - Black Text + White BG */}
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={user.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       focus:outline-none placeholder-gray-500 hover:border-gray-400
                       transition-all duration-200"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={user.email}
            onChange={handleChange}
            autoComplete="off"
            className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       focus:outline-none placeholder-gray-500 hover:border-gray-400
                       transition-all duration-200"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={user.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       focus:outline-none placeholder-gray-500 hover:border-gray-400
                       transition-all duration-200"
            required
          />

          <input
            name="number"
            type="tel"
            placeholder="Mobile Number"
            value={user.number}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       focus:outline-none placeholder-gray-500 hover:border-gray-400
                       transition-all duration-200"
            required
          />

          <select
            name="role"
            value={user.role}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       focus:outline-none cursor-pointer hover:border-gray-400
                       transition-all duration-200"
          >
            <option value="VOLUNTEER">Volunteer</option>
            <option value="ORGANIZER">Organizer</option>
            {/* <option value="ADMIN">Admin</option> */}
          </select>

          {/* Fixed Button - Blue */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                       text-white font-bold py-3 rounded-xl text-lg shadow-lg hover:shadow-xl 
                       transform hover:-translate-y-0.5 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <span
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}