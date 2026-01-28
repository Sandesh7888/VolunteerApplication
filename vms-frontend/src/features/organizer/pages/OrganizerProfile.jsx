import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useApi } from '../../../useApi';
import {
  User, Mail, Phone, Shield, Edit3, Save, X, Loader2,
  Camera, Briefcase, Calendar, Star, Users, CheckCircle2
} from 'lucide-react';

export default function OrganizerProfile() {
  const { user: authUser } = useAuth();
  const { apiCall } = useApi();
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
    if (authUser?.userId) {
      fetchProfile();
    } else if (authUser === null) {
      setLoading(false);
      setError("Please log in to view organization details.");
    }
  }, [authUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/users/${authUser.userId}`);
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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin w-12 h-12 text-emerald-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading organization profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-emerald-50">
           <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
           <h2 className="text-2xl font-black text-gray-900 mb-2">Details Unavailable</h2>
           <p className="text-gray-500 mb-6">{error || "The organization details could not be loaded."}</p>
           <button onClick={() => window.location.reload()} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all">
              Try Again
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="relative mb-8">
        <div className="h-48 rounded-[2.5rem] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between">
             <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl transition-transform group-hover:scale-105">
                    <div className="w-full h-full rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-3xl">
                      {profile?.name?.charAt(0) || 'O'}
                    </div>
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all border-2 border-white">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-white pb-2">
                  <h1 className="text-3xl font-black tracking-tight">{profile?.name}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <p className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold border border-white/20">
                      <Briefcase className="w-3 h-3" />
                      ORGANIZER
                    </p>
                    <p className="flex items-center gap-2 px-3 py-1 bg-cyan-400/20 backdrop-blur-md rounded-lg text-xs font-bold border border-cyan-400/20 text-cyan-100">
                      <Shield className="w-3 h-3" />
                      ORG ID: {profile?.vmsId || 'TBD'}
                    </p>
                  </div>
                </div>
             </div>
             {!isEditing && (
               <button
                 onClick={() => setIsEditing(true)}
                 className="mb-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-white/30 transition-all border border-white/30"
               >
                 <Edit3 className="w-4 h-4" />
                 Edit Profile
               </button>
             )}
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold animate-in fade-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-emerald-50">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              Organization Details
            </h2>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase tracking-widest px-1">Organization Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3.5 text-black bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold disabled:opacity-75 disabled:cursor-not-allowed"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase tracking-widest px-1 text-rose-400">Public Email (Locked)</label>
                  <div className="relative opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 text-black bg-gray-100 border-none rounded-2xl font-semibold cursor-not-allowed"
                      value={profile?.email}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase tracking-widest px-1">Contact Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="Add contact number"
                      className="w-full pl-12 pr-4 py-3 bg-white text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium placeholder-gray-500 transition-all outline-none"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase tracking-widest px-1">Official Organization ID</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 bg-cyan-50 text-cyan-700 rounded-2xl font-black text-xs uppercase tracking-tighter border border-cyan-100">
                    <Shield className="w-4 h-4 fill-current" />
                    {profile?.vmsId || 'PENDING ASSIGNMENT'}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-emerald-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Save Organization
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: profile.name, number: profile.number });
                    }}
                    className="px-8 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
           <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-emerald-50">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Host Stats</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                       <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-2xl font-black text-gray-900">0</p>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Events</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 bg-amber-50/50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                       <Star className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-2xl font-black text-gray-900">N/A</p>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg. Rating</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl shadow-gray-100 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Platform Status</p>
                <p className="font-bold text-sm mb-4">Your organization is fully verified and active.</p>
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                   <CheckCircle2 className="w-4 h-4" />
                   Trusted Partner
                </div>
              </div>
              <Briefcase className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-12" />
           </div>
        </div>
      </div>
    </div>
  );
}