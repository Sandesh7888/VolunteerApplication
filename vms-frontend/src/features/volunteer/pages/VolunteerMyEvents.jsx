// src/features/volunteer/pages/VolunteerMyEvents.jsx - ✅ ONLY VIEW DETAILS
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { 
  Calendar, MapPin, Users, Tag, Clock, Eye 
} from 'lucide-react';

export default function VolunteerMyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { apiCall } = useApi();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await apiCall('/events/volunteer/myevents').catch(() => []);
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayStatus = (status) => {
    const statusMap = {
      'PUBLISHED': 'ONGOING',
      'APPROVED': 'ONGOING'
    };
    return statusMap[status] || status;
  };

  const filteredEvents = events.filter(event => {
    const displayStatus = getDisplayStatus(event.status);
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || displayStatus.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    const colors = {
      'ONGOING': 'bg-green-100 text-green-800 border-green-300',
      'UPCOMING': 'bg-blue-100 text-blue-800 border-blue-300',
      'COMPLETED': 'bg-gray-100 text-gray-800 border-gray-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
      'PENDING': 'bg-amber-100 text-amber-800 border-amber-300'
    };
    return colors[displayStatus] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-emerald-500 to-green-600 bg-clip-text text-transparent mb-4 leading-tight -tracking-tight drop-shadow-lg">
            My Events ({filteredEvents.length})
          </h1>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-28 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Users className="w-16 h-16 text-gray-500" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">No events found</h2>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search' : "You haven't joined any events yet"}
            </p>
            <Link to="/volunteer/events" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all">
              Browse Available Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-200">
                {/* Status Badge */}
                <div className={`px-6 py-3 font-bold text-sm uppercase tracking-wide border-b-2 ${getStatusColor(event.status)}`}>
                  {getDisplayStatus(event.status)}
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>

                  {/* Organizer */}
                  <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">👥 Organizer</p>
                    <p className="font-semibold text-gray-900">{event.organizer?.name || 'Community Team'}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <Calendar size={18} className="text-blue-500" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {event.dateTime ? new Date(event.dateTime).toLocaleDateString('en-IN') : 'TBD'}
                        </div>
                        <div className="text-xs text-gray-500">Date</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <Clock size={18} className="text-green-500" />
                      <div>
                        <div className="font-semibold text-gray-900">9AM–1PM</div>
                        <div className="text-xs text-gray-500">Time</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                      <MapPin size={18} className="text-emerald-500" />
                      <div>
                        <div className="font-semibold text-gray-900 truncate">{event.locationName}</div>
                        <div className="text-xs text-gray-500">Location</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                      <Tag size={18} className="text-purple-500" />
                      <div>
                        <div className="font-semibold capitalize text-gray-900">{event.category}</div>
                        <div className="text-xs text-gray-500">Category</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                      <span>Progress: {event.currentVolunteers}/{event.requiredVolunteers}</span>
                      <span>{Math.round((event.currentVolunteers / event.requiredVolunteers) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full shadow-inner transition-all duration-1000"
                        style={{ width: `${(event.currentVolunteers / event.requiredVolunteers) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* ✅ ONLY VIEW DETAILS BUTTON WITH EYE ICON */}
                  <div className="flex justify-center">
                    <Link
                      to={`/volunteer/events/${event.id}`}
                      className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-lg rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex-1 max-w-sm"
                    >
                      <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
