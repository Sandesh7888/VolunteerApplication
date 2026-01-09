import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useApi } from "../../../useApi"; 
import { Activity, CheckCircle2, FileText, Users, Loader2 } from 'lucide-react';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    totalVolunteers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const myEvents = await apiCall("/events/myevents");
      
      const totalEvents = myEvents.length;
      const publishedEvents = myEvents.filter(e => e.status === 'PUBLISHED').length;
      const draftEvents = myEvents.filter(e => e.status === 'DRAFT').length;
      
      setStats({
        totalEvents,
        publishedEvents,
        draftEvents,
        totalVolunteers: myEvents.reduce((sum, e) => sum + (e.currentVolunteers || 0), 0)
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
          <p className="text-xl text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
            Welcome Back, {user?.name || user?.email?.split('@')[0]}
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 font-medium max-w-2xl mx-auto">
            Your organizing journey continues...
          </p>
        </div>

        {/* Stats Cards - Consistent Purple/Indigo Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {/* Total Events */}
          <div className="group bg-white/95 backdrop-blur-xl p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-purple-100 hover:border-purple-200 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3 flex items-center space-x-2">
                  <Activity size={18} />
                  <span>Total Events</span>
                </p>
                <p className="text-4xl lg:text-5xl font-bold text-gray-900 mb-1">{stats.totalEvents}</p>
                <p className="text-sm text-gray-500 font-medium">All your events</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300">
                <Activity size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          {/* Published Events */}
          <div className="group bg-white/95 backdrop-blur-xl p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-green-100 hover:border-green-200 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3 flex items-center space-x-2">
                  <CheckCircle2 size={18} />
                  <span>Published Events</span>
                </p>
                <p className="text-4xl lg:text-5xl font-bold text-gray-900 mb-1">{stats.publishedEvents}</p>
                <p className="text-sm text-gray-500 font-medium">Live & active</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Draft Events */}
          <div className="group bg-white/95 backdrop-blur-xl p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-yellow-100 hover:border-yellow-200 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide mb-3 flex items-center space-x-2">
                  <FileText size={18} />
                  <span>Draft Events</span>
                </p>
                <p className="text-4xl lg:text-5xl font-bold text-gray-900 mb-1">{stats.draftEvents}</p>
                <p className="text-sm text-gray-500 font-medium">Ready to publish</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300">
                <FileText size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Total Volunteers */}
          <div className="group bg-white/95 backdrop-blur-xl p-8 lg:p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-indigo-100 hover:border-indigo-200 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-3 flex items-center space-x-2">
                  <Users size={18} />
                  <span>Total Volunteers</span>
                </p>
                <p className="text-4xl lg:text-5xl font-bold text-gray-900 mb-1">{stats.totalVolunteers}</p>
                <p className="text-sm text-gray-500 font-medium">Community impact</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300">
                <Users size={24} className="text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <Link 
            to="/organizer/create-event" 
            className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-10 lg:p-12 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 text-center flex flex-col items-center justify-center h-full border border-purple-500/20"
          >
            <Activity size={48} className="mb-6 group-hover:scale-110 transition-transform duration-300 opacity-90" />
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">Create Event</h3>
            <p className="text-lg opacity-90 font-medium">Launch your next community impact</p>
          </Link>

          <Link 
            to="/organizer/events" 
            className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-10 lg:p-12 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 text-center flex flex-col items-center justify-center h-full border border-indigo-500/20"
          >
            <FileText size={48} className="mb-6 group-hover:scale-110 transition-transform duration-300 opacity-90" />
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">Manage Events</h3>
            <p className="text-lg opacity-90 font-medium">View & edit your events</p>
          </Link>

          <div className="bg-white/95 backdrop-blur-xl p-10 lg:p-12 rounded-2xl shadow-xl border border-purple-100 text-center flex flex-col items-center justify-center h-full">
            <Users size={48} className="mb-6 text-gray-400" />
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Coming Soon</h3>
            <p className="text-lg text-gray-600 font-medium">Analytics & Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
