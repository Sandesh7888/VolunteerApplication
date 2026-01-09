import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from "../../../useApi"; 
import { Plus, Search, X, Edit2, Trash2, Calendar, MapPin, Users, Tag, Loader2 } from 'lucide-react';

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const eventsData = await apiCall("/events/myevents");
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event permanently?')) return;

    try {
      
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'PUBLISHED': return 'from-green-500 to-emerald-600 text-white';
      case 'DRAFT': return 'from-yellow-500 to-amber-600 text-gray-900';
      case 'COMPLETED': return 'from-blue-500 to-indigo-600 text-white';
      case 'CANCELLED': return 'from-gray-500 to-gray-600 text-white';
      default: return 'from-gray-500 to-gray-600 text-white';
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
    <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 leading-tight">
              My Events
            </h1>
            <p className="text-xl text-gray-700">Manage all your created events</p>
          </div>
          
          {/* ✅ SEARCH + CREATE BUTTONS SIDE BY SIDE */}
          <div className="flex items-center space-x-4 self-start lg:self-auto">
            {/* Search Toggle */}
            {searchOpen ? (
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events by title..."
                  className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 shadow-sm text-gray-900 placeholder-gray-500 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={toggleSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-all duration-200"
                >
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            ) : (
              <button
                onClick={toggleSearch}
                className="w-14 h-14 flex-shrink-0 bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 flex items-center justify-center group"
                title="Search events"
              >
                <Search size={20} className="text-purple-600 group-hover:scale-110 transition-transform duration-200" />
              </button>
            )}
            
            {/* Create Button */}
            <Link 
              to="/organizer/create-event" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-3 flex-shrink-0"
            >
              <Plus size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span>Create New Event</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 shadow-sm">
            {error}
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Calendar className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">No Events {searchTerm ? 'Match' : 'Created'}</h3>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              {searchTerm 
                ? `No events found matching "${searchTerm}"` 
                : "Start by creating your first community event"
              }
            </p>
            <Link 
              to="/organizer/create-event" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-4 rounded-xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>{searchTerm ? 'Try Different Search' : 'Launch First Event'}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl border border-purple-100 hover:border-purple-300 overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wide shadow-md ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/organizer/events/${event.id}/edit`)} 
                        className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-200"
                        title="Edit Event"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(event.id)} 
                        className="p-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-200"
                        title="Delete Event"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-purple-600 transition-colors duration-200">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 text-lg leading-relaxed mb-8 line-clamp-3">{event.description}</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-bold text-purple-600 uppercase tracking-wide space-x-1">
                        <Calendar size={16} />
                        <span>Date</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN') : 'TBD'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-bold text-purple-600 uppercase tracking-wide space-x-1">
                        <MapPin size={16} />
                        <span>Location</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{event.locationName}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-bold text-purple-600 uppercase tracking-wide space-x-1">
                        <Users size={16} />
                        <span>Volunteers</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{event.currentVolunteers || 0}/{event.requiredVolunteers || 0}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-bold text-purple-600 uppercase tracking-wide space-x-1">
                        <Tag size={16} />
                        <span>Category</span>
                      </div>
                      <div className="text-xl font-bold capitalize text-gray-900">{event.category}</div>
                    </div>
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
