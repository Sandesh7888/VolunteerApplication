import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useApi } from '../../../useApi';
import { useParams } from 'react-router-dom';
import DocumentUpload from '../../common/components/DocumentUpload';
import EventActivity from '../../common/components/EventActivity';
import { 
  User, Mail, Phone, Shield, Edit3, Save, X, Loader2, 
  Camera, MapPin, Calendar, Heart, Award, CheckCircle2,
  Trophy, Star, Zap, Activity, ShieldCheck
} from 'lucide-react';

export default function VolunteerProfile() {
  const { id } = useParams();
  const { user: authUser, login, refreshUser } = useAuth();
  const { apiCall } = useApi();
  const isAdmin = authUser?.role === 'ADMIN';
  const targetId = id || authUser?.userId;
  const isTargetingOther = id && id !== String(authUser?.userId);
  const isAdminView = isAdmin && isTargetingOther;
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (targetId) {
      fetchProfile();
      if (!isTargetingOther) refreshUser();
    } else if (authUser === null) {
      setLoading(false);
      setError("You must be logged in to view this profile.");
    }
  }, [targetId]); // Removed authUser to prevent infinite loop

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/users/${targetId}`);
      setProfile(data);
      setFormData({
        name: data.name || '',
        number: data.number || '',
      });
    } catch (err) {
      console.error('Fetch profile error:', err);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedData = await apiCall(`/users/${authUser.userId}`, {
        method: 'PUT',
        body: {
          ...profile,
          name: formData.name,
          number: formData.number,
        }
      });
      setProfile(updatedData);
      login(updatedData); // Update global auth state
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-pulse"></div>
          <Loader2 className="animate-spin w-20 h-20 text-indigo-600 absolute inset-0" />
        </div>
        <p className="mt-6 text-gray-500 font-bold tracking-tight animate-pulse underline decoration-indigo-500/30 underline-offset-4">Preparing your dashboard...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-12 shadow-2xl border border-white/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
           <User className="w-20 h-20 text-gray-200 mx-auto mb-6 drop-shadow-sm" />
           <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Profile Missing</h2>
           <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">{error || "We couldn't retrieve your profile information."}</p>
           <button onClick={() => window.location.reload()} className="group px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 mx-auto">
              <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Try Again
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="w-[90%] max-w-[1400px] mx-auto p-4 md:p-10 space-y-10">
        {/* Page Title Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">Profile Dashboard</h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-8 h-1 bg-indigo-600 rounded-full"></div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Account Management & Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-black text-gray-600">Account Health: <span className="text-emerald-600">Excellent</span></span>
          </div>
        </div>

        {message.text && (
        <div className={`p-5 rounded-[2rem] flex items-center gap-4 font-black text-sm tracking-tight animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-100/50 shadow-emerald-200/20' : 'bg-rose-50 text-rose-800 border-2 border-rose-100/50 shadow-rose-200/20'
        }`}>
          <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </div>
          {message.text}
        </div>
      )}

      {/* Main Content Area - Swapped Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Dynamic Sidebar - Now on Left (4 cols) */}
        <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
           {/* User Identity Card */}
           <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Profile Photo - Moved inside card */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-[2rem] bg-indigo-50/20 backdrop-blur-md p-1 border border-white/30 shadow-2xl group/photo transition-all duration-500 hover:rotate-3">
                    <div className="w-full h-full rounded-[1.75rem] bg-white flex items-center justify-center text-indigo-600 shadow-inner">
                      <User className="w-16 h-16" />
                    </div>
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2.5 bg-white text-indigo-600 rounded-xl shadow-xl hover:scale-110 transition-all border-2 border-transparent hover:border-indigo-100 group/cam">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-3xl font-black tracking-tight mb-2">{profile?.name || 'Volunteer'}</h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-200">Level 12</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <div className="px-5 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between group/id hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-500/30 rounded-lg">
                        <Shield className="w-3.5 h-3.5 text-indigo-100" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Role</span>
                    </div>
                    <span className="text-xs font-black tracking-wider px-3 py-1 bg-white/20 rounded-lg border border-white/30">VOLUNTEER</span>
                  </div>

                  <div className="px-5 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between group/id hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/30 rounded-lg">
                        <Award className="w-3.5 h-3.5 text-amber-100" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-100">VMS ID</span>
                    </div>
                    <span className="text-xs font-black tracking-wider">{profile?.vmsId || 'TBD'}</span>
                  </div>

                  <div className="px-5 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between group/id hover:bg-white/20 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/30 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-emerald-100" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Region</span>
                    </div>
                    <span className="text-xs font-black tracking-wider">Global Member</span>
                  </div>
                </div>

                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-4 px-6 py-4 bg-white text-indigo-600 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] group/edit"
                  >
                    <Edit3 className="w-4 h-4 transition-transform group-hover:-rotate-12" />
                    Configure Profile
                  </button>
                )}
              </div>
           </div>

           {/* Achievement Card - Hidden for Admin View */}
           {!isAdminView && (
           <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-indigo-900/5 border border-indigo-50/50 relative overflow-hidden group/card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover/card:scale-150"></div>
              
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-8 flex items-center justify-between">
                Milestones
                <Trophy className="w-4 h-4 text-amber-400" />
              </h3>

              <div className="space-y-5">
                 <div className="group/stat flex items-center gap-5 p-5 bg-gradient-to-br from-indigo-50/80 to-indigo-50/20 backdrop-blur-sm rounded-[2rem] border border-white transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-200/30">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg rotate-3 group-hover/stat:rotate-0 transition-transform">
                       <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-1">12</p>
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Missions Completed</p>
                    </div>
                 </div>

                 <div className="group/stat flex items-center gap-5 p-5 bg-white rounded-[2rem] border border-gray-100 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-200/20">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center text-white shadow-lg -rotate-3 group-hover/stat:rotate-0 transition-transform">
                       <Star className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-1">4.9</p>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Impact Rating</p>
                    </div>
                 </div>

                 <div className="group/stat flex items-center gap-5 p-5 bg-white rounded-[2rem] border border-gray-100 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-200/20">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-lg rotate-6 group-hover/stat:rotate-0 transition-transform">
                       <Zap className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-1">2.4k</p>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Hours Contributed</p>
                    </div>
                 </div>
              </div>
           </div>
           )}

           {/* Support/Quick Links - Hidden for Admin View */}
           {!isAdminView && (
           <div className="bg-indigo-900 rounded-[3rem] p-8 text-white relative overflow-hidden group/support shadow-2xl shadow-indigo-200">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="relative z-10">
                <Heart className="w-10 h-10 text-indigo-400 mb-6 animate-pulse" />
                <h3 className="text-xl font-black mb-2 tracking-tight">Need Support?</h3>
                <p className="text-indigo-200 text-xs font-medium leading-relaxed mb-8">Our verification team is here to help you 24/7. Reach out for any document queries.</p>
                <button className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-xl">
                  Contact Support
                </button>
              </div>
           </div>
           )}

           {/* Event Activity - Visible for Admin View */}
           {isAdminView && (
             <EventActivity userId={targetId} userRole="VOLUNTEER" />
           )}
        </div>

        {/* Main Content Area - Now on Right (8 cols) */}
        <div className="lg:col-span-8 space-y-10 order-1 lg:order-2">
          {/* Account Details with Card Style */}
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-900/5 border border-indigo-50/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 transition-transform duration-1000 group-hover:scale-110"></div>
            
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  Account Mastery
                  <div className="flex -space-x-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white"></div>
                    ))}
                  </div>
                </h2>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Personal Identity Cluster</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-indigo-100 group/edit"
                >
                  <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              )}
            </div>

            <form onSubmit={handleUpdate} className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1 font-sans">Full Legal Name</label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within/input:text-indigo-500 group-focus-within/input:scale-110 transition-all" />
                    <input
                      type="text"
                      required
                      disabled={!isEditing}
                      className="w-full pl-12 pr-6 py-4 text-gray-900 bg-gray-50/50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder:text-gray-300 disabled:opacity-75 disabled:cursor-not-allowed text-lg"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-1 font-sans">Email Connection</label>
                  <div className="relative opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="email"
                      disabled
                      className="w-full pl-12 pr-6 py-4 bg-gray-100/50 text-gray-500 border-2 border-transparent rounded-[1.5rem] font-bold cursor-not-allowed text-lg"
                      value={profile?.email}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1 font-sans">Mobile Contact</label>
                  <div className="relative group/input">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within/input:text-indigo-500 group-focus-within/input:scale-110 transition-all" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-12 pr-6 py-4 text-gray-900 bg-gray-50/50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder:text-gray-300 disabled:opacity-75 disabled:cursor-not-allowed text-lg"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] px-1 font-sans">System Verification ID</label>
                  <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-br from-indigo-50/50 to-white text-indigo-700 rounded-[1.5rem] font-black text-base uppercase tracking-tight border-2 border-indigo-100/30 group-hover:border-indigo-200/50 transition-colors shadow-sm shadow-indigo-100/20">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg ring-4 ring-indigo-50">
                      <Award className="w-4 h-4" />
                    </div>
                    {profile?.vmsId || 'VERIFYING...'}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-4 pt-8 animate-in slide-in-from-bottom-5 duration-500">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:from-indigo-700 hover:to-indigo-800 shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Update Identity
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: profile.name, number: profile.number });
                    }}
                    className="px-10 py-5 bg-gray-50 text-gray-600 rounded-3xl font-black hover:bg-gray-100 transition-all hover:text-gray-900 active:scale-95"
                  >
                    Discard Changes
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Verification Status Card - Shown when verified */}
          {profile?.documentsVerified && !isAdminView && (
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-[3rem] p-10 border-2 border-emerald-100/50 relative overflow-hidden group mb-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-200 ring-8 ring-emerald-50">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Verification Successful</h3>
                    <p className="text-gray-500 font-bold max-w-sm">Your identity has been verified. You now have full access to all platform features.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center p-6 bg-white rounded-[2rem] border border-emerald-100 shadow-sm min-w-[200px]">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">System ID</span>
                   <span className="text-2xl font-black text-gray-900 tracking-tighter">{profile?.vmsId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Documents Section - Always Visible */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 blur-3xl rounded-full scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <DocumentUpload 
              targetUserId={targetId} 
              isAdminView={isAdminView} 
              onVerificationChange={fetchProfile} 
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}