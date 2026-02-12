import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Users, UserPlus, CheckCircle2 } from "lucide-react";
import authBg from "../../../assets/home_hero.png";
import Nav from "../../../pages/Nav";

export default function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "VOLUNTEER",
    number: ""
  });

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setUser(prev => ({ ...prev, email: "", password: "" }));
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const setRole = (role) => {
    setUser({ ...user, role });
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed or email already exists");
      }

      setSuccess("Account created! Please enter the OTP sent to your email.");
      setShowOtp(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`http://localhost:8080/api/auth/verify-otp?email=${user.email}&otp=${otp}`, {
        method: "POST"
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid or expired OTP");
      }

      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center py-12 px-4 h-screen">
      <Nav/>
      {/* 1. BACKGROUND IMAGE + GRADIENT OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img 
          src={authBg} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-90/40 via-blue-90/40 to-emerald-90/40" />
        <div className="absolute top-0 left-0 w-full h-full bg-slate-900/20" />
      </div>

      {/* Main container - moved 10px down */}
      <div className="max-w-5xl w-full mt-10 translate-y-[10px] relative z-10 transition-all duration-500">
        {/* Glass Card - Split Layout */}
        <div className="bg-white/80 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[3rem] border border-white/40 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left Column: Info & Roles */}
            <div className="p-8 md:p-12 bg-slate-50/50 flex flex-col justify-center border-slate-100 md:border-r">
              <div className="mb-10">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 leading-tight">
                  Join the <span className="text-emerald-600">Network.</span>
                </h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Create Identity Node</p>
              </div>

              {/* Role Selection Cards */}
              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("VOLUNTEER")}
                  className={`relative p-5 rounded-3xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-95
                    ${user.role === "VOLUNTEER" 
                      ? "border-emerald-500 bg-white shadow-lg shadow-emerald-500/10" 
                      : "border-slate-100 bg-white/50 hover:border-slate-200"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors
                    ${user.role === "VOLUNTEER" ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"}`}>
                    <Users size={20} />
                  </div>
                  <h3 className={`font-black text-[10px] uppercase tracking-wider mb-1
                    ${user.role === "VOLUNTEER" ? "text-emerald-700" : "text-slate-500"}`}>Volunteer</h3>
                  <p className="text-xs text-slate-400 font-bold">Join Events</p>
                  {user.role === "VOLUNTEER" && (
                    <div className="absolute top-4 right-4 text-emerald-500">
                      <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("ORGANIZER")}
                  className={`relative p-5 rounded-3xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-95
                    ${user.role === "ORGANIZER" 
                      ? "border-indigo-500 bg-white shadow-lg shadow-indigo-500/10" 
                      : "border-slate-100 bg-white/50 hover:border-slate-200"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-colors
                    ${user.role === "ORGANIZER" ? "bg-indigo-500 text-white" : "bg-slate-50 text-slate-400"}`}>
                    <UserPlus size={20} />
                  </div>
                  <h3 className={`font-black text-[10px] uppercase tracking-wider mb-1
                    ${user.role === "ORGANIZER" ? "text-indigo-700" : "text-slate-500"}`}>Organizer</h3>
                  <p className="text-xs text-slate-400 font-bold">Create Events</p>
                  {user.role === "ORGANIZER" && (
                    <div className="absolute top-4 right-4 text-indigo-500">
                      <CheckCircle2 size={16} fill="currentColor" className="text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 mb-6 rounded-2xl text-xs font-bold text-center border border-rose-100 italic">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 text-emerald-600 p-4 mb-6 rounded-2xl text-xs font-bold text-center border border-emerald-100 italic flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  {success}
                </div>
              )}

              {!showOtp ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <input
                      name="name"
                      type="text"
                      placeholder="Full Name"
                      value={user.name}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                                 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                                 focus:outline-none text-sm font-bold placeholder-slate-400
                                 hover:border-slate-300 transition-all duration-300 shadow-sm"
                      autoComplete="off"
                      required
                    />

                    <input
                      name="number"
                      type="tel"
                      placeholder="Mobile Number"
                      value={user.number}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                                 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                                 focus:outline-none text-sm font-bold placeholder-slate-400
                                 hover:border-slate-300 transition-all duration-300 shadow-sm"
                      autoComplete="off"
                      required
                    />

                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={user.email}
                      onChange={handleChange}
                      autoComplete="one-time-code"
                      className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                                 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                                 focus:outline-none text-sm font-bold placeholder-slate-400
                                 hover:border-slate-300 transition-all duration-300 shadow-sm"
                      required
                    />

                    <input
                      name="password"
                      type="password"
                      placeholder="Secure Password"
                      value={user.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                                 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50
                                 focus:outline-none text-sm font-bold placeholder-slate-400
                                 hover:border-slate-300 transition-all duration-300 shadow-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4.5 px-6 rounded-2xl text-sm uppercase tracking-widest shadow-xl
                               transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300
                               disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {loading ? "INITIALIZING..." : "CREATE ACCOUNT"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center mb-6">
                    <p className="text-slate-600 font-bold text-sm">Verifying {user.email}</p>
                  </div>
                  <input
                    type="text"
                    placeholder="6-Digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-6 py-5 bg-white text-slate-900 border border-slate-200 rounded-3xl
                               focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                               focus:outline-none text-3xl tracking-[0.5em] text-center font-black placeholder:tracking-normal placeholder:text-sm placeholder:font-bold
                               hover:border-slate-300 transition-all duration-300"
                    autoComplete="off"
                    maxLength={6}
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4.5 px-6 rounded-2xl text-sm uppercase tracking-widest shadow-xl
                               transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "VERIFYING..." : "VERIFY EMAIL"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="w-full text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:text-slate-800 transition-colors"
                  >
                    Back to Registration
                  </button>
                </form>
              )}

              <div className="text-center mt-10 pt-8 border-t border-slate-100">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">ALREADY REGISTERED?</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 group text-emerald-600 font-bold text-sm hover:underline"
                >
                  Access Identity <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
