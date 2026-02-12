import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ArrowRight, ShieldCheck, Activity } from "lucide-react";
import authBg from "../../../assets/home_hero.png";
import Nav from "../../../pages/Nav";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

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
      login(user);

      if (user.role === "ADMIN") navigate("/admin/dashboard");
      else if (user.role === "ORGANIZER") navigate("/organizer/dashboard");
      else navigate("/volunteer/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center py-6 px-4">
     <Nav/>
      {/* 1. BACKGROUND IMAGE + GRADIENT OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img 
          src={authBg} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-6/90 via-blue-6/90 to-emerald-60/50" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Glass Card */}
        <div className="bg-white/80 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] p-10 border border-white/50 text-slate-900">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full mb-6 font-bold text-[10px] tracking-widest uppercase italic">
              <ShieldCheck size={12} /> Secure Access
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
              Resume <span className="text-emerald-600">Impact.</span>
            </h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Identify to Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-xs font-bold italic text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                           focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                           focus:outline-none text-sm font-bold placeholder-slate-400
                           hover:border-slate-300 transition-all duration-300"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                           focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                           focus:outline-none text-sm font-bold placeholder-slate-400
                           hover:border-slate-300 transition-all duration-300"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <div className="flex justify-end px-2">
                <Link 
                  to="/forgot-password" 
                  className="text-emerald-600 hover:text-emerald-700 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl text-sm uppercase tracking-widest shadow-xl
                         transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Activity size={18} className="animate-spin" /> AUTHENTICATING...
                </span>
              ) : (
                "INITIATE ACCESS"
              )}
            </button>
          </form>

          <div className="text-center mt-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">DISCOVERY NEW PATH?</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 group text-emerald-600 font-bold text-sm hover:underline"
            >
              Initialize Node <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
