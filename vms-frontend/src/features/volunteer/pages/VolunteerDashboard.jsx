// src/features/volunteer/pages/VolunteerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { 
  Users, Clock, Calendar, Award, MapPin, CheckCircle, Loader2, ArrowRight 
} from 'lucide-react';

const VolunteerDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalHours: 0,
    upcomingEvents: 0,
    completedEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { apiCall } = useApi();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [myEvents] = await Promise.all([
        apiCall('/events/volunteer/myevents').catch(() => []),
      ]);
      
      const now = new Date();
      const upcoming = myEvents.filter(event => 
        new Date(event.dateTime) > now && event.status === 'PUBLISHED'
      );
      const completed = myEvents.filter(event => event.status === 'COMPLETED');

      setStats({
        totalEvents: myEvents.length,
        totalHours: myEvents.reduce((sum, event) => sum + (event.duration || 4), 0),
        upcomingEvents: upcoming.length,
        completedEvents: completed.length
      });
      setRecentEvents(upcoming.slice(0, 3));
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-emerald-600" />
          <p className="text-xl text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-blue-50 to-emerald-50 min-h-screen pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
            Welcome Back, {user?.name || 'Volunteer'}!
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 font-medium max-w-2xl mx-auto">
            Making a difference, one event at a time
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                <p className="text-sm text-gray-600 font-medium">Total Events</p>
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-emerald-100 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-100 rounded-2xl group-hover:bg-emerald-200 transition-colors">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.totalHours}</p>
                <p className="text-sm text-gray-600 font-medium">Hours Volunteered</p>
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                <p className="text-sm text-gray-600 font-medium">Upcoming</p>
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-indigo-100 hover:border-indigo-200 transition-all duration-300 hover:-translate-y-2">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-100 rounded-2xl group-hover:bg-indigo-200 transition-colors">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{stats.completedEvents}</p>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* UPCOMING EVENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RECENT EVENTS */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-100 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calendar className="w-10 h-10 text-emerald-600" />
                Upcoming Events
              </h2>
              {recentEvents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No upcoming events</h3>
                  <Link 
                    to="/volunteer/events" 
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                  >
                    Browse Events <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentEvents.map(event => (
                    <Link 
                      key={event.id}
                      to={`/volunteer/my-events`}
                      className="group block p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl hover:shadow-xl transition-all border border-blue-100 hover:border-emerald-200 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {event.title}
                        </h3>
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-full">
                          {event.currentVolunteers}/{event.requiredVolunteers}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.dateTime).toLocaleDateString('en-IN')}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {event.locationName}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-emerald-100 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <Link 
                  to="/volunteer/events"
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="p-3 bg-emerald-100 rounded-2xl group-hover:bg-emerald-200 transition-colors">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Find Events</p>
                    <p className="text-sm text-gray-600">Browse available events</p>
                  </div>
                </Link>
                <Link 
                  to="/volunteer/my-events"
                  className="group flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="p-3 bg-blue-100 rounded-2xl group-hover:bg-blue-200 transition-colors">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">My Events</p>
                    <p className="text-sm text-gray-600">Manage applications</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
