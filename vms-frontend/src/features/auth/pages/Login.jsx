import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // ✅ Clear autofilled values on mount
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
      }

      const user = await response.json();
      console.log("Login successful:", user);

      login(user);

      // ✅ Role-based navigation
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "ORGANIZER") {
        navigate("/organizer/dashboard");
      } else {
        navigate("/volunteer/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border border-white/50">
          <div className="text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
            autoComplete="off"
          >
            {/* ✅ Chrome autofill blocker */}
            <input
              type="text"
              name="fakeusernameremembered"
              style={{ display: "none" }}
            />
            <input
              type="password"
              name="fakepasswordremembered"
              style={{ display: "none" }}
            />

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl animate-pulse">
                {error}
              </div>
            )}

            <div>
              <input
                type="email"
                name="email"
                autoComplete="username"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-2xl
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           focus:outline-none text-base placeholder-gray-500
                           hover:border-gray-400 transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-2xl
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           focus:outline-none text-base placeholder-gray-500
                           hover:border-gray-400 transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                         text-white font-bold py-4 px-6 rounded-2xl text-lg shadow-xl hover:shadow-2xl
                         transform hover:-translate-y-1 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center pt-8">
            <p className="text-gray-700 mb-4">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-white/50 backdrop-blur-sm border-2 border-blue-500
                         text-blue-600 font-semibold rounded-2xl hover:bg-blue-50 hover:border-blue-600
                         transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
