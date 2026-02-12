import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from "../../../useApi"; 
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { Plus, Search, X, Eye, Edit2, Trash2, Calendar, MapPin, Users, Tag, Loader2, Users2, MoreVertical, CheckCircle, Clock } from 'lucide-react';
import { formatTime, getEventStatus } from '../../../utils/formatters';
import { sortEvents } from '../../../utils/sorters';
import VolunteerListModal from '../components/VolunteerListModal';

export default function OrganizerEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({});
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.userId) {
        fetchMyEvents();
    }
  }, [user?.userId]);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(sortEvents(filtered));
  }, [searchTerm, events]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const eventsData = await apiCall(`/events/myevents?userId=${user.userId}`);
      setEvents(eventsData);
      setFilteredEvents(sortEvents(eventsData));
      
      const counts = {};
      for (const event of eventsData) {
        try {
          const volunteers = await apiCall(`/events/${event.id}/volunteers`);
          const pendingCount = volunteers.filter(v => v.status === 'PENDING').length;
          counts[event.id] = pendingCount;
        } catch (err) {
          counts[event.id] = 0;
        }
      }
      setPendingCounts(counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await apiCall(`/events/${eventId}/publish`, { method: 'PATCH' });
      await fetchMyEvents();
      alert("Event published successfully! ✅");
    } catch (err) {
      console.error("Failed to approve event:", err);
      alert("Failed to publish event.");
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event permanently?')) return;
    try {
      if (!user?.userId) return;
      await apiCall(`/events/${eventId}?userId=${user.userId}`, { method: 'DELETE' });
      await fetchMyEvents();
    } catch (err) {
      window.location.reload();
    }
  };

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchTerm('');
    }
    setSearchOpen(!searchOpen);
  };

  const openVolunteerModal = (eventId) => {
    setSelectedEventId(eventId);
    setIsVolunteerModalOpen(true);
  };

  // Status - ONLY TEXT COLOR, NO BORDER/BG
  const getStatusStyle = (status) => {
    switch(status) {
      case 'LIVE': return 'text-rose-600 font-bold animate-pulse';
      case 'UPCOMING': return 'text-purple-600 font-bold';
      case 'PUBLISHED': return 'text-green-600 font-bold';
      case 'DRAFT': return 'text-yellow-600 font-bold';
      case 'COMPLETED': return 'text-slate-600 font-bold';
      case 'CANCELLED': return 'text-red-500 font-bold line-through';
      case 'PENDING_APPROVAL': return 'text-orange-600 font-bold';
      case 'REJECTED': return 'text-red-600 font-bold';
      default: return 'text-gray-600 font-bold';
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
          <p className="text-xl text-gray-600">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-12 gap-4 lg:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 leading-tight">
              My Events
            </h1>
            <p className="text-lg sm:text-xl text-gray-700">Manage all your created events</p>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2">
            {searchOpen ? (
              <div className="relative w-64 sm:w-80 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-10 pr-10 py-3 bg-white/95 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={toggleSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                >
                  <X size={18} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            ) : (
              <button
                onClick={toggleSearch}
                className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 flex items-center justify-center"
              >
                <Search size={18} className="text-purple-600" />
              </button>
            )}
            
            <Link 
              to="/organizer/create-event" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2 min-w-[140px] justify-center"
            >
              <Plus size={18} />
              <span>Create Event</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl mb-6 shadow-sm">
            {error}
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">No Events {searchTerm ? 'Match' : 'Created'}</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm ? `No events found matching "${searchTerm}"` : "Start by creating your first community event"}
            </p>
            <Link 
              to="/organizer/create-event" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>{searchTerm ? 'Try Different Search' : 'Launch First Event'}</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-purple-100 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] table-auto">
                <thead className="sticky top-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-b-2 border-purple-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide w-[30%]">Event</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide w-[12%]">Date & Time</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide w-[15%]">Location</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide w-[10%] text-center">Volunteers</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide w-[10%]">Category</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide w-[10%]">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-wide w-[13%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-200 bg-white/95 border-b border-purple-50">
                      {/* Event Title */}
                      <td className="px-3 sm:px-4 lg:px-6 py-4">
                        <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 truncate">
                          {event.title}
                        </h3>
                      </td>

                      {/* Date & Time */}
                      <td className="px-3 sm:px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center space-x-1 text-xs sm:text-sm font-bold text-gray-900">
                            <Calendar size={14} className="text-purple-600 flex-shrink-0" />
                            <span>
                              {(event.startDate || event.dateTime) && (event.startDate !== 'null' || event.dateTime !== 'null') 
                                ? new Date(event.startDate || event.dateTime).toLocaleDateString('en-IN') 
                                : 'TBD'
                              }
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-[10px] sm:text-xs font-medium text-gray-500">
                            <Clock size={12} className="text-indigo-400 flex-shrink-0" />
                            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-3 sm:px-4 py-4">
                        <div className="flex items-center space-x-1 text-xs sm:text-sm font-bold text-gray-900 truncate">
                          <MapPin size={14} className="text-purple-600 flex-shrink-0" />
                          <span>{event.locationName || 'TBD'}</span>
                        </div>
                      </td>

                      {/* Volunteers */}
                      <td className="px-3 sm:px-4 py-4">
                        <div className="flex items-center space-x-1 text-xs sm:text-sm font-bold text-gray-900">
                          <Users size={14} className="text-purple-600 flex-shrink-0" />
                          <span>{(event.currentVolunteers || 0)}/{(event.requiredVolunteers || 0)}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 sm:px-4 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase tracking-wide">
                          {event.category || 'General'}
                        </span>
                      </td>

                      {/* Status - COMPUTED */}
                      <td className="px-3 sm:px-4 py-4">
                        {(() => {
                           const status = getEventStatus(
                             event.startDate, 
                             event.endDate, 
                             event.startTime, 
                             event.endTime, 
                             event.status
                           );
                           return (
                             <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${getStatusStyle(status)}`}>
                               {status?.replace('_', ' ') || 'Unknown'}
                             </span>
                           );
                        })()}
                      </td>

                      {/* STABLE HOVER MENU - NO ROW MOVEMENT */}
                      {/* ACTIONS - INLINE BUTTONS */}
                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-right">
                        {(() => {
                           const status = getEventStatus(
                             event.startDate, 
                             event.endDate, 
                             event.startTime, 
                             event.endTime, 
                             event.status
                           );
                           const isEditable = status === 'DRAFT' || status === 'PENDING_APPROVAL' || status === 'UPCOMING' || status === 'REJECTED';
                           
                           return (
                            <div className="flex items-center justify-end space-x-2">
                              {event.status === 'PENDING_APPROVAL' && (
                                <button 
                                  onClick={() => handleApproveEvent(event.id)}
                                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                  title="Publish Event"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              <Link 
                                to={`/organizer/events/${event.id}`}
                                className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </Link>
                              <button 
                                onClick={() => openVolunteerModal(event.id)}
                                className="relative p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                                title="Manage Volunteers"
                              >
                                <Users2 size={18} />
                                {pendingCounts[event.id] > 0 && (
                                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">
                                      {pendingCounts[event.id]}
                                    </span>
                                  </span>
                                )}
                              </button>
                              
                              {isEditable ? (
                                <Link 
                                  to={`/organizer/events/${event.id}/edit`}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="Edit Event"
                                >
                                  <Edit2 size={18} />
                                </Link>
                              ) : (
                                <div className="p-2 text-gray-300 cursor-not-allowed" title="Event has started/ended - Edit disabled">
                                  <Edit2 size={18} />
                                </div>
                              )}
                              
                              <button 
                                onClick={() => handleDelete(event.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete Event"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                           );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <VolunteerListModal 
        isOpen={isVolunteerModalOpen}
        onClose={() => {
          setIsVolunteerModalOpen(false);
          fetchMyEvents(); // Refresh counts when closing
        }}
        eventId={selectedEventId}
      />
    </div>
  );
}
