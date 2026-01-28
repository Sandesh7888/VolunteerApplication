import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import authBg from "../../../assets/home_hero.png";

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
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center py-6 px-4">
      
      {/* 1. BACKGROUND IMAGE + GRADIENT OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img 
          src={authBg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-blue-600/90 to-emerald-500/90" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Glass Card */}
        <div className="bg-white/80 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] p-10 border border-white/50">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
              Join the <span className="text-emerald-600">Network.</span>
            </h2>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Create Identity Node</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 mb-4 rounded-xl text-xs font-bold text-center border border-rose-100 italic">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 mb-4 rounded-xl text-xs font-bold text-center border border-emerald-100 italic">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={user.name}
              onChange={handleChange}
              className="w-full px-6 py-3.5 bg-white text-slate-900 border border-slate-200 rounded-2xl
                         focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                         focus:outline-none text-sm font-bold placeholder-slate-400
                         hover:border-slate-300 transition-all duration-300"
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={user.email}
              onChange={handleChange}
              autoComplete="off"
              className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                         focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                         focus:outline-none text-sm font-bold placeholder-slate-400
                         hover:border-slate-300 transition-all duration-300"
              required
            />

            <input
              name="number"
              type="tel"
              placeholder="Mobile Number"
              value={user.number}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                         focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                         focus:outline-none text-sm font-bold placeholder-slate-400
                         hover:border-slate-300 transition-all duration-300"
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
                         focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                         focus:outline-none text-sm font-bold placeholder-slate-400
                         hover:border-slate-300 transition-all duration-300"
              required
            />

            <select
              name="role"
              value={user.role}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                         focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                         focus:outline-none text-sm font-bold cursor-pointer
                         hover:border-slate-300 transition-all duration-300"
            >
              <option value="VOLUNTEER">Volunteer</option>
              <option value="ORGANIZER">Organizer</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl text-sm uppercase tracking-widest shadow-xl
                         transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "INITIALIZING..." : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="text-center mt-8">
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
  );
}
