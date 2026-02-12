import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import authBg from "../../../assets/home_hero.png";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`http://localhost:8080/api/auth/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`, {
        method: "POST"
      });

      if (!res.ok) {
        throw new Error("Failed to reset password. Invalid or expired OTP.");
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center py-6 px-4">
      <div className="absolute inset-0 z-0">
        <img src={authBg} alt="Background" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-blue-600/90 to-emerald-500/90" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] p-10 border border-white/50">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
              Reset <span className="text-emerald-600">Password.</span>
            </h2>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Update Identity Key</p>
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
            <div className="text-center mb-2">
              <p className="text-slate-600 text-xs font-bold italic">Resetting for: {email}</p>
            </div>
            
            <input
              type="text"
              placeholder="6-Digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                         focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                         focus:outline-none text-2xl tracking-[0.5em] text-center font-black placeholder:tracking-normal placeholder:text-sm placeholder:font-bold
                         hover:border-slate-300 transition-all duration-300"
              maxLength={6}
              required
            />

            <input
              type="password"
              placeholder="New Secure Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                         focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                         focus:outline-none text-sm font-bold placeholder-slate-400
                         hover:border-slate-300 transition-all duration-300"
              required
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl
                         focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                         focus:outline-none text-sm font-bold placeholder-slate-400
                         hover:border-slate-300 transition-all duration-300"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl text-sm uppercase tracking-widest shadow-xl
                         flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock size={18} />
              {loading ? "UPDATING..." : "RESET PASSWORD"}
            </button>
          </form>

          <div className="text-center mt-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 group text-slate-500 font-bold text-sm hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
