import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useApi } from '../../../useApi';
import { useParams } from 'react-router-dom';
import DocumentUpload from '../../common/components/DocumentUpload';
import EventActivity from '../../common/components/EventActivity';
import {
  User, Mail, Phone, Shield, Edit3, Save, X, Loader2,
  Camera, Briefcase, Calendar, Star, Users, CheckCircle2,
  Building2, Globe, TrendingUp, Zap
} from 'lucide-react';

export default function OrganizerProfile() {
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
    if (targetId && targetId !== "undefined") {
      fetchProfile();
      if (targetId === String(authUser?.userId)) refreshUser();
    } else if (authUser === null) {
      setLoading(false);
      setError("Please log in to view organization details.");
    }
  }, [targetId]); // Removed authUser to prevent infinite loop

  const fetchProfile = async () => {
    if (!targetId || targetId === "undefined") return;
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
      setMessage({ type: 'success', text: 'Organization profile updated!' });
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
          <div className="w-20 h-20 border-4 border-emerald-100 rounded-full animate-pulse"></div>
          <Loader2 className="animate-spin w-20 h-20 text-emerald-600 absolute inset-0" />
        </div>
        <p className="mt-6 text-gray-500 font-bold tracking-tight animate-pulse underline decoration-emerald-500/30 underline-offset-4">Syncing organization data...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-12 shadow-2xl border border-white/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
           <Building2 className="w-20 h-20 text-gray-200 mx-auto mb-6 drop-shadow-sm" />
           <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Details Unavailable</h2>
           <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">{error || "The organization details could not be loaded."}</p>
           <button onClick={() => window.location.reload()} className="group px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-3 mx-auto">
              <TrendingUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
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
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">Organization Dashboard</h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-8 h-1 bg-emerald-600 rounded-full"></div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Partner Hub & Performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-black text-gray-600">Growth Status: <span className="text-emerald-600">Premium Partner</span></span>
          </div>
        </div>
      {/* Header Section with Corporate Aesthetics */}
      <div className="relative rounded-[3rem] overflow-hidden group">
        {/* Modern Corporate Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-700 transition-all duration-700 group-hover:scale-105"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/pentagon.png')] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-48 -mt-48 transition-transform duration-1000 group-hover:translate-x-5 group-hover:-translate-y-5"></div>
        
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-8 backdrop-blur-[1px]">
           <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="relative">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl group/avatar transition-all duration-500 hover:rotate-3">
                  <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center text-emerald-600 font-black text-4xl shadow-inner border border-emerald-100/50">
                    {profile?.name?.charAt(0) || 'O'}
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 p-3 bg-white text-emerald-600 rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-transparent hover:border-emerald-100 hover:text-emerald-700 active:scale-95 group/cam">
                  <Camera className="w-5 h-5 group-hover/cam:rotate-12 transition-transform" />
                </button>
              </div>

              <div className="text-white space-y-3">
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none drop-shadow-md">{profile?.name}</h1>
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-[10px] font-black tracking-widest uppercase border border-white/30 shadow-sm flex items-center gap-2">
                    <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    Verified Partner
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                  <div className="px-4 py-1.5 bg-emerald-500/30 backdrop-blur-md rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    ORGANIZER
                  </div>
                  <div className="px-4 py-1.5 bg-cyan-500/30 backdrop-blur-md rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2 text-cyan-100">
                    <Shield className="w-3.5 h-3.5" />
                    ORG ID: {profile?.vmsId || 'TBD'}
                  </div>
                  <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    Eco-System Host
                  </div>
                </div>
              </div>
           </div>

           {!isEditing && (
             <button 
               onClick={() => setIsEditing(true)}
               className="group px-8 py-4 bg-white/10 hover:bg-white text-white hover:text-emerald-900 backdrop-blur-xl rounded-3xl font-black flex items-center gap-3 transition-all duration-500 border border-white/20 hover:border-white shadow-2xl hover:shadow-white/20 active:scale-95"
             >
               <Edit3 className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
               Edit Organization
             </button>
           )}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Analytics - Now on Left (4 cols) */}
        <div className="lg:col-span-4 space-y-10 order-2 lg:order-1">
           <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-emerald-900/5 border border-emerald-50/50 relative overflow-hidden group/card text-center md:text-left">
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-50">Organization Metrics</h3>

              <div className="space-y-6">
                 <div className="flex flex-col items-center p-6 bg-emerald-50/50 rounded-[2.5rem] border border-white hover:border-emerald-100 transition-colors">
                    <p className="text-5xl font-black text-gray-900 tracking-tighter mb-2">0</p>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Events</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-cyan-50/50 rounded-[2rem] flex flex-col items-center">
                       <Users className="w-6 h-6 text-cyan-600 mb-2" />
                       <p className="text-xl font-black text-gray-900 leading-none">0</p>
                       <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">Impact</p>
                    </div>
                    <div className="p-5 bg-amber-50/50 rounded-[2rem] flex flex-col items-center">
                       <Star className="w-6 h-6 text-amber-500 mb-2" />
                       <p className="text-xl font-black text-gray-900 leading-none">5.0</p>
                       <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">Trust</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-emerald-950 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="inline-flex p-3 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Trusted Partner Status</p>
                  <p className="font-bold text-xl leading-tight">Your organization is recognized for excellence.</p>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                </div>
              </div>
              <Briefcase className="absolute -bottom-8 -right-8 w-40 h-40 text-white/[0.03] rotate-12 transition-transform duration-1000 group-hover:rotate-0" />
           </div>

           {/* Event Activity - Visible for Admin View */}
           {isAdminView && (
             <EventActivity userId={targetId} userRole="ORGANIZER" />
           )}
        </div>

        {/* Main Content Area - Now on Right (8 cols) */}
        <div className="lg:col-span-8 space-y-10 order-1 lg:order-2">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-emerald-900/5 border border-emerald-50/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 transition-transform duration-1000 group-hover:scale-110"></div>
            
            <div className="flex items-center justify-between mb-10 border-b border-gray-50 pb-6 relative z-10">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl ring-4 ring-emerald-50/50">
                  <Shield className="w-6 h-6" />
                </span>
                Company Profile
              </h2>
              {isEditing && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Managing Details</span>}
            </div>

            <form onSubmit={handleUpdate} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] px-1">Registred Entity Name</label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within/input:text-emerald-500 group-focus-within/input:scale-110 transition-all" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      className="w-full pl-12 pr-6 py-4 text-gray-900 bg-gray-50/50 border-2 border-transparent focus:border-emerald-100 focus:bg-white rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold placeholder:text-gray-300 disabled:opacity-75 disabled:cursor-not-allowed text-lg"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Organization Mail (Locked)</label>
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
                  <label className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] px-1">Headquarters Contact</label>
                  <div className="relative group/input">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within/input:text-emerald-500 group-focus-within/input:scale-110 transition-all" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="Add contact number"
                      className="w-full pl-12 pr-6 py-4 text-gray-900 bg-gray-50/50 border-2 border-transparent focus:border-emerald-100 focus:bg-white rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold placeholder:text-gray-300 disabled:opacity-75 disabled:cursor-not-allowed text-lg"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] px-1">Authorized ID (Protected)</label>
                  <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-br from-emerald-50/50 to-white text-emerald-700 rounded-[1.5rem] font-black text-base uppercase tracking-tight border-2 border-emerald-100/30 group-hover:border-emerald-200/50 transition-colors shadow-sm shadow-emerald-100/20">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg ring-4 ring-emerald-50">
                      <Shield className="w-4 h-4" />
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
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-5 rounded-3xl font-black flex items-center justify-center gap-3 hover:from-emerald-700 hover:to-emerald-800 shadow-xl shadow-emerald-200 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Confirm Identity
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: profile.name, number: profile.number });
                    }}
                    className="px-10 py-5 bg-gray-50 text-gray-600 rounded-3xl font-black hover:bg-gray-100 transition-all hover:text-gray-900 active:scale-95"
                  >
                    Reset Changes
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
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Organization Verified</h3>
                    <p className="text-gray-500 font-bold max-w-sm">Your organization identity has been fully verified. You can now host events and engage with volunteers.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center p-6 bg-white rounded-[2rem] border border-emerald-100 shadow-sm min-w-[200px]">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Partner ID</span>
                   <span className="text-2xl font-black text-gray-900 tracking-tighter">{profile?.vmsId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Documents Section - Always Visible */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 blur-3xl rounded-full scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
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