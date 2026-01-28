// src/features/volunteer/pages/VolunteerAvailableEvents.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { 
  Calendar, MapPin, Users, Tag, CheckCircle, Loader2, Search, Filter, Clock, Eye, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { sortEvents } from '../../../utils/sorters';

export default function VolunteerAvailableEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myEvents, setMyEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall } = useApi();

  useEffect(() => {
    fetchAvailableEvents();
    fetchMyEvents();
  }, []);

  // Update searchTerm when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search');
    if (query !== null) {
      setSearchTerm(query);
    }
  }, [location.search]);

  const fetchAvailableEvents = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/events/available');
      setEvents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const data = await apiCall('/volunteers/history?volunteerId=' + user.userId);
      setMyEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch my events:', err);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const response = await apiCall(`/volunteers/join/${eventId}?volunteerId=${user.userId}`, {
        method: 'POST'
      });

      if (response) {
        alert('✅ Application sent! Waiting for organizer approval.');
        fetchAvailableEvents();
        fetchMyEvents();
      }
    } catch (err) {
      alert('❌ Application failed. ' + (err.message || 'Please try again.'));
    }
  };

  // Improved Sorting Logic: Open Registration > Soon > Others
  const getSortedEvents = (eventList) => {
    const now = new Date();
    
    const getPriority = (event) => {
      const regOpen = event.registrationOpenDateTime ? new Date(event.registrationOpenDateTime) : null;
      const regClose = event.registrationCloseDateTime ? new Date(event.registrationCloseDateTime) : null;
      
      const isOpen = (!regOpen || now >= regOpen) && (!regClose || now <= regClose);
      const isSoon = regOpen && now < regOpen;
      
      if (isOpen && regClose && now <= regClose) return 0; // Open
      if (isSoon) return 1; // Soon
      return 2; // Closed/Others
    };

    return [...eventList].sort((a, b) => {
      const pA = getPriority(a);
      const pB = getPriority(b);
      
      if (pA !== pB) return pA - pB;
      
      // Secondary Sort
      if (pA === 0) { // Both Open -> Closes soonest first
        return new Date(a.registrationCloseDateTime || a.startDate) - new Date(b.registrationCloseDateTime || b.startDate);
      }
      if (pA === 1) { // Both Soon -> Opens soonest first
        return new Date(a.registrationOpenDateTime) - new Date(b.registrationOpenDateTime);
      }
      // Both Others -> Start date descending
      return new Date(b.startDate) - new Date(a.startDate);
    });
  };

  // Get unique categories
  const categories = ['All', ...new Set(events.map(event => event.category))];

  // Filter and Sort events
  const filteredEvents = getSortedEvents(
    events.filter(event => {
      const title = event.title?.toLowerCase() || '';
      const desc = event.description?.toLowerCase() || '';
      const loc = event.locationName?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();

      const matchesSearch = title.includes(term) || desc.includes(term) || loc.includes(term);
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
  );

  const appliedEventIds = myEvents.map(ev => ev.event.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <p className="text-lg text-slate-500 font-bold tracking-tight">Loading premium events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 px-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-1">
              Browse Events
            </h1>
            <p className="text-slate-500 font-bold">Discover your next impact</p>
          </div>
          
          {/* Compact Search/Filter Row */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-semibold"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'text-slate-500 hover:text-emerald-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 px-6 py-4 rounded-2xl mb-8 font-bold flex items-center gap-3">
             <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
             {error}
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-200 shadow-sm mx-2">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No matching events</h3>
            <p className="text-slate-500 font-bold">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEvents.map((event) => {
              const isApplied = appliedEventIds.includes(event.id);
              const now = new Date();
              const regOpen = event.registrationOpenDateTime ? new Date(event.registrationOpenDateTime) : null;
              const regClose = event.registrationCloseDateTime ? new Date(event.registrationCloseDateTime) : null;
              
              const isRegNotStarted = regOpen && now < regOpen;
              const isRegClosed = regClose && now > regClose;
              const isRegOpen = (!regOpen || now >= regOpen) && (!regClose || now <= regClose);

              // Registration Text Logic
              let regLabel = "Register Now";
              let regColor = "text-emerald-600 bg-emerald-50";
              if (isRegNotStarted) {
                regLabel = "Opening Soon";
                regColor = "text-blue-600 bg-blue-50";
              } else if (isRegClosed) {
                regLabel = "Closed";
                regColor = "text-slate-500 bg-slate-100";
              }

              return (
                <div 
                  key={event.id} 
                  className={`group relative bg-white rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full overflow-hidden ${
                    isRegOpen && !isRegClosed && !isApplied
                      ? 'border-emerald-200 hover:border-emerald-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(16,185,129,0.1)]' 
                      : 'border-slate-100 opacity-95 shadow-sm'
                  } hover:-translate-y-2`}
                >
                  {/* Floating Action Badge */}
                  <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 backdrop-blur-md ${
                    isRegOpen && !isRegClosed ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100/50 text-slate-500'
                  }`}>
                    {isRegOpen && !isRegClosed && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                    {regLabel}
                  </div>

                  <div className="p-6 lg:p-7 flex-1 flex flex-col">
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-emerald-50 rounded-xl">
                        <Tag size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
                        {event.category || 'Environmental'}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-black text-slate-900 leading-[1.2] mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2 pr-12">
                        {event.title}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* Info Blocks: Event & Registration */}
                    <div className="space-y-4 mb-8 mt-auto">
                      
                      {/* 1. EVENT SCHEDULE */}
                      <div className="relative p-4 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                          <Calendar size={40} className="text-slate-900" />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                           <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                           <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Event Timeline</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Starts</p>
                            <p className="text-sm font-black text-slate-800 leading-none">
                              {event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD'}
                            </p>
                            <p className="text-[11px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">
                              {event.startTime ? event.startTime.substring(0, 5) : 'TBD'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Ends</p>
                            <p className="text-sm font-black text-slate-800 leading-none">
                              {event.endDate ? new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : (event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBD')}
                            </p>
                            <p className="text-[11px] font-bold text-slate-600 mt-1 uppercase tracking-tighter">
                              {event.endTime ? event.endTime.substring(0, 5) : 'TBD'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 2. REGISTRATION WINDOW */}
                      <div className={`p-4 rounded-3xl border ${isRegClosed ? 'bg-rose-50 border-rose-100' : isRegNotStarted ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                        <div className="flex items-center gap-2 mb-3">
                           <div className={`w-1.5 h-4 rounded-full ${isRegClosed ? 'bg-rose-500' : isRegNotStarted ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                           <span className={`text-[11px] font-black uppercase tracking-widest ${isRegClosed ? 'text-rose-500' : isRegNotStarted ? 'text-blue-500' : 'text-emerald-700'}`}>
                              Registration Window
                           </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Opens</p>
                            <p className="text-xs font-black text-slate-700">
                              {regOpen ? regOpen.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Immediate'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                              {regOpen ? regOpen.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Closes</p>
                            <p className={`text-xs font-black ${isRegClosed ? 'text-rose-600' : 'text-slate-700'}`}>
                              {regClose ? regClose.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Till Start'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                              {regClose ? regClose.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 3. LOCATION & CAPACITY */}
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                            <MapPin size={18} className="text-emerald-500" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-800 truncate max-w-[120px]">{event.locationName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{event.city}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex -space-x-2 mb-1">
                             {[...Array(3)].map((_, i) => (
                               <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                                 <Users size={10} className="text-slate-400" />
                               </div>
                             ))}
                          </div>
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            {event.currentVolunteers || 0} / {event.requiredVolunteers || 0} Slots
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Action Footer */}
                    <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                      <Link 
                        to={`/volunteer/events/${event.id}`}
                        className="flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest text-slate-500 border-2 border-slate-50 hover:bg-slate-50 transition-all hover:text-slate-900 hover:border-slate-100"
                      >
                        <Eye size={16} /> Info
                      </Link>
                      
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={isApplied || (event.currentVolunteers >= event.requiredVolunteers) || isRegNotStarted || isRegClosed}
                        className={`py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgb(16,185,129,0.15)] ${
                          isApplied 
                            ? 'bg-emerald-100 text-emerald-800 cursor-default shadow-none border-2 border-emerald-200' 
                            : (event.currentVolunteers >= event.requiredVolunteers || isRegNotStarted || isRegClosed)
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border-2 border-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-500/30 active:scale-[0.96]'
                        }`}
                      >
                        {isApplied ? (
                          <><CheckCircle size={16} /> Applied</>
                        ) : isRegNotStarted ? (
                          'Wait'
                        ) : isRegClosed ? (
                          'Closed'
                        ) : (
                          <><ArrowRight size={16} /> Apply</>
                        )}
                      </button>
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
