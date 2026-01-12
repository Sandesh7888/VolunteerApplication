// src/features/admin/pages/AdminDashboard.jsx - NO SCROLLBAR
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../../useApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalOrganizers: 0,
    totalVolunteers: 0,
    pendingApprovals: 0,
    recentEvents: []
  });
  const [loading, setLoading] = useState(true);
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching dashboard data...');
      
      const publishedEvents = await apiCall('/events/published').catch(() => []);
      console.log('📋 Published events:', publishedEvents.length);
      
      const allEvents = await apiCall('/events').catch(() => []);
      console.log('📋 All events:', allEvents.length);
      
      const eventsData = allEvents.length > 0 ? allEvents : publishedEvents;
      
      const totalEvents = eventsData.length;
      const totalVolunteers = eventsData.reduce((sum, event) => sum + (event.currentVolunteers || 0), 0);
      const totalOrganizers = eventsData.length > 0 ? 2 : 0;
      const pendingApprovals = 0;

      const recentEventsData = eventsData.slice(0, 5);

      setStats({
        totalEvents,
        totalVolunteers,
        totalOrganizers,
        pendingApprovals,
        recentEvents: recentEventsData
      });

      console.log('✅ DASHBOARD STATS:', {
        totalEvents, totalVolunteers, totalOrganizers, pendingApprovals
      });
      
    } catch (error) {
      console.error('❌ Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">Admin Dashboard</h1>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-lg text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* ✅ STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold opacity-90 mb-3">Total Events</h3>
                    <p className="text-4xl font-bold">{stats.totalEvents}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold opacity-90 mb-3">Organizers</h3>
                    <p className="text-4xl font-bold">{stats.totalOrganizers}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold opacity-90 mb-3">Volunteers</h3>
                    <p className="text-4xl font-bold">{stats.totalVolunteers}</p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-orange-400 to-orange-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold opacity-90 mb-3">Pending Approvals</h3>
                    <p className="text-4xl font-bold">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ RECENT EVENTS - SCROLLBAR HIDDEN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Events - NO SCROLLBAR */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Events</h3>
                {stats.recentEvents.length > 0 ? (
                  <div className="space-y-4 max-h-96 scrollbar-hide overflow-y-auto">
                    {stats.recentEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 rounded-xl cursor-pointer transition-all border-l-4 border-blue-500 hover:shadow-md hover:-translate-y-1"
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-xl text-gray-900 truncate pr-4 max-w-md">
                            {event.title || 'Untitled Event'}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                            event.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status || 'Unknown'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium text-gray-900">Volunteers:</span>
                            <div>{event.currentVolunteers || 0}/{event.requiredVolunteers || 0}</div>
                          </div>
                          {event.startDate && (
                            <div>
                              <span className="font-medium text-gray-900">Date:</span>
                              <div>{new Date(event.startDate).toLocaleDateString('en-IN')}</div>
                            </div>
                          )}
                          {event.locationName && (
                            <div className="truncate">
                              <span className="font-medium text-gray-900">Location:</span>
                              <div>{event.locationName}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      📋
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">No Recent Events</h3>
                    <p className="text-gray-600">Events will appear here when published</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Quick Actions</h3>
                <div className="space-y-4">
                  <Link 
                    to="/admin/events"
                    className="block p-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-2xl font-semibold text-center transition-all transform hover:-translate-y-1 text-lg h-20 flex items-center justify-center"
                  >
                    Manage Events ({stats.totalEvents})
                  </Link>
                  <Link 
                    to="/admin/volunteers"
                    className="block p-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg hover:shadow-2xl font-semibold text-center transition-all transform hover:-translate-y-1 text-lg h-20 flex items-center justify-center"
                  >
                    View Organizers ({stats.totalOrganizers})
                  </Link>
                  <Link 
                    to="/admin/users"
                    className="block p-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg hover:shadow-2xl font-semibold text-center transition-all transform hover:-translate-y-1 text-lg h-20 flex items-center justify-center"
                  >
                    View Reports
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ✅ HIDE SCROLLBAR GLOBALLY - ADD TO YOUR CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
