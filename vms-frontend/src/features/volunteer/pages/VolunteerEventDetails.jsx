// src/features/volunteer/pages/VolunteerEventDetails.jsx - FIXED DATA + COLORS
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { 
   ArrowLeft, Calendar, MapPin, Clock, Tag, Users, Eye, Share2, Heart, MessageSquare, ShieldCheck, UserCheck, ShieldAlert
} from 'lucide-react';
import { formatTime } from '../../../utils/formatters';

export default function VolunteerEventDetails() {
  const { eventId } = useParams();
  const [allEvents, setAllEvents] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const { user } = useAuth();
  const { apiCall } = useApi();

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!event) return;
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(event.startDate + 'T' + (event.startTime || '00:00'));
      const end = new Date((event.endDate || event.startDate) + 'T' + (event.endTime || '23:59'));

      if (now < start) {
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`Starts in: ${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`);
      } else if (now >= start && now <= end) {
        const diff = end - now;
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`LIVE! Ends in: ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Event Ended');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      
      // 1. Try to find in history (to get status)
      let eventData = null;
      let participationStatus = null;
      
      try {
        const eventsData = await apiCall(`/volunteers/history?volunteerId=${user.userId}`);
        const foundItem = eventsData.find(item => item.event.id == eventId);
        
        if (foundItem) {
          eventData = foundItem.event;
          participationStatus = foundItem.status;
        }
      } catch (err) {
        console.warn('History fetch failed or empty', err);
      }

      // 2. If not in history, fetch public event details
      if (!eventData) {
        try {
          const publicEvent = await apiCall(`/events/details/${eventId}`);
          eventData = publicEvent;
        } catch (err) {
          console.error('Failed to fetch public event details', err);
        }
      }

      if (eventData) {
        setEvent({
          ...eventData,
          participationStatus: participationStatus // will be null if not joined
        });
      }

      // Fetch all joined volunteers for this event
      try {
        const volData = await apiCall(`/events/${eventId}/volunteers`);
        const joinedVols = volData.filter(v => v.status === 'APPROVED' || v.status === 'ATTENDED');
        setVolunteers(joinedVols);
      } catch (err) {
        console.warn('Failed to fetch volunteers list', err);
      }

    } catch (err) {
      console.error('Event fetch error:', err);
    } finally {
      setLoading(false);
    }
  };


  const getDisplayStatus = (status) => {
    const statusMap = { 'PUBLISHED': 'ONGOING', 'APPROVED': 'ONGOING' };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    const colors = {
      'LIVE': 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse', // New LIVE color
      'ONGOING': 'bg-orange-100 text-orange-800 border-orange-300',
      'UPCOMING': 'bg-blue-100 text-blue-800 border-blue-300',
      'COMPLETED': 'bg-gray-100 text-gray-800 border-gray-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'ATTENDED': 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
    return colors[displayStatus] || colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-200 rounded-2xl"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-gray-500">
          <Link to="/volunteer/my-events" className="hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> My Events
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">{event?.title}</span>
        </nav>

        {event ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Title & Status */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                      {event.title}
                    </h1>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(event.status)}`}>
                        {getDisplayStatus(event.status)}
                      </span>
                      {event.participationStatus === 'ATTENDED' && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border bg-emerald-100 text-emerald-800 border-emerald-300">
                          <ShieldCheck size={16} /> Attended
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-6 flex items-center gap-4">
                     <span className="hidden md:inline-flex px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-black rounded-xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform cursor-default border-2 border-white">
                        ⭐ Earn 50 Pts
                     </span>
                    <div>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {Math.max(0, event.requiredVolunteers - event.currentVolunteers)}
                      </div>
                      <div className="text-sm text-gray-500">Needed</div>
                    </div>
                  </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  {/* Date */}
                  <div className="group p-4 rounded-xl hover:bg-white transition-all border border-blue-100 hover:border-blue-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="font-bold text-xl text-blue-700 mb-1 tracking-tight">
                      {new Date(event.startDate).toLocaleDateString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Date</div>
                  </div>

                  {/* Countdown Timer (New) */}
                  <div className="group p-4 rounded-xl hover:bg-white transition-all border border-rose-100 hover:border-rose-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                         <Clock className="w-6 h-6 text-white" />
                       </div>
                    </div>
                    <div className="font-bold text-lg text-rose-700 mb-1 tracking-tight truncate">
                       {timeLeft || 'Loading...'}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Timer</div>
                  </div>

                  {/* Location */}
                  <div className="group p-4 rounded-xl hover:bg-white transition-all border border-emerald-100 hover:border-emerald-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="font-bold text-xl text-emerald-700 mb-1 tracking-tight truncate">{event.locationName || 'TBD'}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Location</div>
                  </div>

                  {/* Category */}
                  <div className="group p-4 rounded-xl hover:bg-white transition-all border border-purple-100 hover:border-purple-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Tag className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="font-bold text-xl text-purple-700 mb-1 tracking-tight">{event.category || 'General'}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Category</div>
                  </div>

                  {/* Time */}
                  <div className="group p-4 rounded-xl hover:bg-white transition-all border border-orange-100 hover:border-orange-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="font-bold text-xl text-orange-700 mb-1 tracking-tight">
                      {formatTime(event.startTime)}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Start Time</div>
                  </div>

                  {/* Registration Window - Showing Manual Schedule */}
                  {(() => {
                    const now = new Date();
                    const regOpen = event.registrationOpenDateTime ? new Date(event.registrationOpenDateTime) : null;
                    const regClose = event.registrationCloseDateTime ? new Date(event.registrationCloseDateTime) : null;
                    
                    const isNotStarted = regOpen && now < regOpen;
                    const isClosed = regClose && now > regClose;
                    
                    return (
                      <div className={`group p-4 rounded-xl hover:bg-white transition-all border shadow-sm ${
                        isClosed ? 'border-red-100 bg-red-50/20' : isNotStarted ? 'border-amber-100 bg-amber-50/20' : 'border-indigo-100 hover:border-indigo-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                            isClosed ? 'bg-gradient-to-br from-red-500 to-red-600' : isNotStarted ? 'bg-gradient-to-br from-amber-500 to-yellow-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                          }`}>
                            <ShieldAlert className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registration</p>
                            <p className={`text-sm font-black ${isClosed ? 'text-red-600' : isNotStarted ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {isClosed ? 'Closed' : isNotStarted ? 'Upcoming' : 'Open Now'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                           <div className="text-left">
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Starts</p>
                              <p className="text-sm font-black text-gray-700">
                                {regOpen ? regOpen.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Immediate'}
                              </p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Ends</p>
                              <p className={`text-sm font-black ${isClosed ? 'text-red-600' : 'text-gray-700'}`}>
                                {regClose ? regClose.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Start'}
                              </p>
                           </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Eye className="w-7 h-7 text-gray-500" />
                  Event Description
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p>{event.description || 'No description available.'}</p>
                </div>
              </div>

              {/* Joined Volunteers Section */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <UserCheck className="w-7 h-7 text-emerald-500" />
                    Joined Volunteers
                  </h2>
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-sm border border-emerald-100">
                    {volunteers.length} Confirmed
                  </span>
                </div>

                {volunteers.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium tracking-tight">Be the first to join this mission!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {volunteers.map((vol) => (
                      <div key={vol.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-200 hover:bg-white hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center text-emerald-700 font-bold text-lg border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                            {(vol.volunteer?.name || 'V').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-1.5">
                              {vol.volunteer?.name}
                              {vol.volunteer?.userId === user.userId && (
                                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase">You</span>
                              )}
                              {vol.status === 'ATTENDED' && (
                                <UserCheck className="w-4 h-4 text-emerald-600" />
                              )}
                            </p>
                            <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                              <Clock size={12} /> Joined {vol.joinedAt ? new Date(vol.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Recently'}
                            </p>
                          </div>
                        </div>
                        
                        <button className="p-2.5 bg-white text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all shadow-sm">
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Volunteer Capacity
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="text-3xl font-black text-gray-900">
                      {Math.max(0, event.requiredVolunteers - event.currentVolunteers)}
                      <span className="text-sm text-gray-400 font-bold ml-1">Needed</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                        {event.currentVolunteers} Joined
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-50">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, (event.currentVolunteers / event.requiredVolunteers) * 100)}%` }}
                    />
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
                     <span className="text-sm font-bold text-purple-700">Total Capacity</span>
                     <span className="text-2xl font-black text-purple-800">
                       {event.requiredVolunteers}
                     </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  {(() => {
                    const now = new Date();
                    const regOpen = event.registrationOpenDateTime ? new Date(event.registrationOpenDateTime) : null;
                    const regClose = event.registrationCloseDateTime ? new Date(event.registrationCloseDateTime) : null;
                    const isRegNotStarted = regOpen && now < regOpen;
                    const isRegClosed = regClose && now > regClose;
                    const isFull = event.currentVolunteers >= event.requiredVolunteers;
                    const isApplied = event.participationStatus != null;

                    if (isApplied) return null; // Already joined, show nothing or different action

                    return (
                      <button
                        disabled={isRegNotStarted || isRegClosed || isFull}
                        className={`w-full block p-4 font-bold rounded-xl text-center shadow-lg transition-all flex items-center justify-center gap-3 py-3 ${
                          isRegNotStarted || isRegClosed || isFull
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:shadow-xl transform hover:-translate-y-1'
                        }`}
                      >
                        {isRegNotStarted ? (
                          <>Wait (Opens {regOpen.toLocaleDateString('en-IN')})</>
                        ) : isRegClosed ? (
                          <>Registration Closed</>
                        ) : isFull ? (
                          <>Event Full</>
                        ) : (
                          <>Join Event Now</>
                        )}
                      </button>
                    );
                  })()}
                  <Link
                    to="/volunteer/available-events"
                    className="w-full block p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-center border border-gray-200 transition-all flex items-center justify-center gap-3 py-3"
                  >
                    Browse More Events
                  </Link>
                  <button className="w-full p-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share Event
                  </button>
                  <button className="w-full p-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    Save Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-8 flex items-center justify-center">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Details</h2>
            <p className="text-xl text-gray-600 mb-8">Loading event information...</p>
            <Link
              to="/volunteer/my-events"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Back to My Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
