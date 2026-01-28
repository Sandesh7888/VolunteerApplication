// src/features/volunteer/pages/VolunteerMyEvents.jsx - ✅ FULLY FIXED
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { 
  Calendar, MapPin, Users, Tag, Clock, Eye, Clock as ClockIcon, Search 
} from 'lucide-react';
import { sortEvents } from '../../../utils/sorters';
import { getEventStatus } from '../../../utils/formatters';

export default function VolunteerMyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // Default to 'upcoming' instead of 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { apiCall } = useApi();

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ FIXED: Use correct participation endpoint
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const history = await apiCall(`/volunteers/history?volunteerId=${user.userId}`);
      
      const eventsWithStatus = history.map(item => ({
        ...item.event,
        registrationId: item.id,
        participationStatus: item.status, 
        registeredAt: item.joinedAt
      }));
      
      setEvents(sortEvents(eventsWithStatus, 'startDate'));
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await apiCall(`/volunteers/${registrationId}/cancel?volunteerId=${user.userId}`, { method: 'DELETE' });
      alert('Request cancelled successfully');
      fetchEvents();
    } catch (err) {
      console.error('Failed to cancel request:', err);
      alert('Failed to cancel request: ' + err.message);
    }
  };

  // ✅ FIXED: Handle EventParticipant statuses
  const getDisplayStatus = (status) => {
    switch (status) {
      case 'APPROVED': return 'joined';
      case 'ATTENDED': return 'completed';
      case 'REJECTED': return 'cancelled';
      case 'REMOVED': return 'cancelled';
      case 'PENDING': return 'pending';
      default: return status.toLowerCase();
    }
  };

  const filteredEvents = events.filter(event => {
    const displayStatus = getDisplayStatus(event.participationStatus);
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // "activeTab" logic:
    // 'upcoming' -> only UPCOMING or PENDING (hide LIVE, COMPLETED, CANCELLED)
    // 'live' -> only LIVE
    // 'all' -> show EVERYTHING
    // specific status -> show only that status

    const computedStatus = getEventStatus(
        event.startDate, 
        event.endDate, 
        event.startTime, 
        event.endTime, 
        event.status 
    );

    if (activeTab === 'upcoming') {
        const isNotCancelled = computedStatus !== 'CANCELLED' && displayStatus !== 'cancelled';
        const isNotLive = computedStatus !== 'LIVE';
        const isNotCompleted = computedStatus !== 'COMPLETED' && displayStatus !== 'completed';
        return matchesSearch && isNotCancelled && isNotLive && isNotCompleted;
    }

    if (activeTab === 'live') {
        return matchesSearch && computedStatus === 'LIVE';
    }

    if (activeTab === 'completed') {
        return matchesSearch && displayStatus === 'completed' && computedStatus !== 'LIVE';
    }

    const matchesTab = activeTab === 'all' || displayStatus.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-800 border-amber-300',
      'joined': 'bg-green-100 text-green-800 border-green-300',
      'completed': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'cancelled': 'bg-rose-100 text-rose-800 border-rose-300',
      'REMOVED': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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
        {/* Header Section - Modern Single Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6 bg-white/40 p-4 rounded-[2.5rem] border border-white/60 backdrop-blur-sm shadow-xl shadow-blue-900/5">
          <div className="flex items-center gap-4 px-4">
            <h1 className="text-3xl font-black text-gray-900 whitespace-nowrap">
              My Events <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xl ml-2">{filteredEvents.length}</span>
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 justify-end">
             {/* Tabs Container */}
             <div className="flex items-center bg-gray-100/80 p-1 rounded-2xl border border-gray-200 w-full md:w-auto overflow-x-auto no-scrollbar">
                {['upcoming', 'live', 'all', 'pending', 'joined', 'completed', 'cancelled'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
             </div>

             {/* Search Container */}
             <div className="relative group w-full md:w-64">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-gray-600 rounded-xl border border-gray-200  focus:border-blue-400 focus:ring-4 focus:ring-blue-50 focus:outline-none bg-white shadow-sm font-medium transition-all text-sm"
                />
             </div>
          </div>
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
            <Link to="/volunteer/browse-events" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const status = getDisplayStatus(event.participationStatus);
              // Calculate computed status for LIVE check
              const computedStatus = getEventStatus(
                event.startDate, 
                event.endDate, 
                event.startTime, 
                event.endTime, 
                event.status
              );
              
              const isCancelled = computedStatus === 'CANCELLED' || status === 'cancelled';
              const isLive = !isCancelled && computedStatus === 'LIVE';
              const isCompleted = computedStatus === 'COMPLETED' || status === 'completed';
              const isUpcoming = computedStatus === 'UPCOMING' && !isCancelled && !isLive && !isCompleted;
              
              // Countdown Logic
              let countdownString = null;
              if (isUpcoming && event.startDate) {
                 const start = new Date(event.startDate);
                 if (event.startTime) {
                    const [h, m] = event.startTime.split(':');
                    start.setHours(parseInt(h), parseInt(m), 0, 0);
                 }
                 const diff = start - new Date();
                 if (diff > 0 && diff < 86400000) { // Less than 24h
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    countdownString = `Starts in ${hours}h ${minutes}m`;
                 } else if (diff > 0) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    countdownString = `Starts in ${days} days`;
                 }
              }

              return (
                <div key={event.id} className={`group bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 border ${isLive ? 'border-rose-400 ring-4 ring-rose-100' : 'border-gray-100 hover:border-blue-200'}`}>
                  {/* Status Badge */}
                  <div className={`px-6 py-3 font-bold text-sm uppercase tracking-wide border-b-2 flex justify-between items-center ${isLive ? 'bg-rose-50 text-rose-600 border-rose-100' : getStatusColor(status)}`}>
                    <div className="flex items-center gap-2">
                        {isLive ? 'LIVE' : status}
                        {status === 'pending' && <ClockIcon className="w-4 h-4 inline animate-spin" />}
                    </div>
                    {isLive && (
                        <div className="flex items-center gap-2 text-rose-600 animate-pulse">
                            <span className="w-2 h-2 bg-rose-600 rounded-full"></span>
                            NOW
                        </div>
                    )}
                    {countdownString && !isLive && (
                        <div className="text-blue-600 normal-case font-bold flex items-center gap-1">
                             <ClockIcon size={14} /> {countdownString}
                        </div>
                    )}
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
                          <div className="font-semibold text-gray-900">{event.startTime || 'TBD'} - {event.endTime || 'TBD'}</div>
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
                        <span>{isLive ? 'Attendance Running' : `Progress: ${event.currentVolunteers}/${event.requiredVolunteers}`}</span>
                        <span>{Math.round((event.currentVolunteers / event.requiredVolunteers) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full shadow-inner transition-all duration-1000 ${isLive ? 'bg-gradient-to-r from-rose-500 to-orange-500 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-emerald-500'}`}
                          style={{ width: `${(event.currentVolunteers / event.requiredVolunteers) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Button Section */}
                    <div className="flex justify-center">
                      {status === 'pending' ? (
                        <button
                          onClick={() => handleCancelRequest(event.registrationId)}
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-lg rounded-3xl border-2 border-rose-200 transition-all duration-300 flex-1 max-w-sm shadow-sm"
                        >
                          Cancel Request
                        </button>
                      ) : (
                        <Link
                          to={`/volunteer/events/${event.id}`}
                          className={`group flex items-center justify-center gap-3 px-8 py-4 font-bold text-lg rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex-1 max-w-sm ${isLive ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' : 'bg-blue-600 hover:bg-gradient-to-r hover:from-blue-700 hover:to-emerald-700 text-white'}`}
                        >
                          <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span>{isLive ? 'Join Live Event' : 'View Details'}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
