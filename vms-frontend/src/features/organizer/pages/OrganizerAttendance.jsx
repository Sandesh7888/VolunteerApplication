import React, { useState, useEffect } from "react";
import { useApi } from "../../../useApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { 
  Users, CheckCircle, XCircle, Loader2, Calendar, MapPin, Search, 
  ChevronRight, ArrowLeft, Users2, Info, AlertTriangle, Clock
} from "lucide-react";
import { getEventStatus } from "../../../utils/formatters";

export default function OrganizerAttendance() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vLoading, setVLoading] = useState(false);
  const [updating, setUpdating] = useState({});
  const { apiCall } = useApi();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.userId) {
      fetchMyEvents();
    }
  }, [user?.userId]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/events/myevents?userId=${user?.userId}`);
      
      // Filter published/completed
      let activeEvents = data.filter(e => e.status === 'PUBLISHED' || e.status === 'COMPLETED');
      
      // Sort: LIVE first, then by date descending
      activeEvents.sort((a, b) => {
        const statusA = getEventStatus(a.startDate, a.endDate, a.startTime, a.endTime);
        const statusB = getEventStatus(b.startDate, b.endDate, b.startTime, b.endTime);
        
        if (statusA === 'LIVE' && statusB !== 'LIVE') return -1;
        if (statusA !== 'LIVE' && statusB === 'LIVE') return 1;
        return new Date(b.startDate) - new Date(a.startDate);
      });

      setEvents(activeEvents);

      // Check URL for direct link
      const params = new URLSearchParams(window.location.search);
      const urlEventId = params.get('eventId');
      if (urlEventId) {
        const found = activeEvents.find(e => e.id.toString() === urlEventId);
        if (found) {
          handleSelectEvent(found);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async (eventId) => {
    try {
      setVLoading(true);
      const data = await apiCall(`/events/${eventId}/volunteers`);
      const approvedOnly = data.filter(v => v.status === 'APPROVED' || v.status === 'ATTENDED');
      setVolunteers(approvedOnly);
    } catch (err) {
      console.error(err);
    } finally {
      setVLoading(false);
    }
  };

  const getEventDates = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const stop = end ? new Date(end) : new Date(start);
    
    // Normalize to UTC/Start of day
    current.setHours(0,0,0,0);
    stop.setHours(0,0,0,0);

    while (current <= stop) {
      dates.push(new Date(current).toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    
    // Determine default selected date
    const dates = getEventDates(event.startDate, event.endDate);
    const today = new Date().toISOString().split('T')[0];
    
    if (dates.includes(today)) {
      setSelectedDate(today);
    } else {
      // Default to latest date if today is not in range
      setSelectedDate(dates[dates.length - 1]);
    }
    
    fetchVolunteers(event.id);
  };

  const toggleAttendance = async (volunteer, date) => {
    const status = getEventStatus(
      selectedEvent.startDate, 
      selectedEvent.endDate, 
      selectedEvent.startTime, 
      selectedEvent.endTime,
      selectedEvent.status
    );
    
    if (status !== 'LIVE' || selectedEvent.status === 'COMPLETED') {
      const message = status === 'UPCOMING' 
        ? "Attendance cannot be taken for upcoming events yet." 
        : "Attendance cannot be modified for completed events.";
      alert(message);
      return;
    }

    setUpdating(prev => ({ ...prev, [`${volunteer.id}-${date}`]: true }));
    try {
      const isAttended = volunteer.attendanceRecords?.some(r => r.date === date && r.status === 'PRESENT');
      
      await apiCall(`/volunteers/${volunteer.id}/attendance?organizerId=${user?.userId}&date=${date}&attended=${!isAttended}`, {
        method: 'PATCH'
      });
      await fetchVolunteers(selectedEvent.id);
    } catch (err) {
      console.error("Attendance update error:", err);
      alert(`Failed to update attendance: ${err.message}`);
    } finally {
      setUpdating(prev => ({ ...prev, [`${volunteer.id}-${date}`]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen pt-20">
      <div className="max-w-7xl mx-auto">
        
        {!selectedEvent ? (
          <>
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">
                Attendance Console
              </h1>
              <p className="text-xl text-gray-600 font-medium">Manage real-time volunteer presence</p>
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-purple-100 shadow-sm">
                <Calendar className="w-20 h-20 text-purple-100 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-400">No active events yet</h3>
                <p className="text-gray-500 mt-2 font-medium">Publish an event to start tracking attendance</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => {
                  const status = getEventStatus(event.startDate, event.endDate, event.startTime, event.endTime);
                  const isLive = status === 'LIVE';
                  
                  return (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      className={`group relative p-8 rounded-[2.5rem] border transition-all duration-300 text-left overflow-hidden ${
                        isLive 
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl shadow-purple-200 border-transparent transform hover:-translate-y-2'
                          : 'bg-white hover:bg-slate-50 border-purple-100 hover:border-purple-200 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isLive && (
                         <div className="absolute top-6 right-6 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-white/90">Live</span>
                         </div>
                      )}

                      <div className={`mb-6 p-4 rounded-2xl inline-block ${isLive ? 'bg-white/20 backdrop-blur-md' : 'bg-purple-50'}`}>
                        <Users2 className={`w-8 h-8 ${isLive ? 'text-white' : 'text-purple-600'}`} />
                      </div>
                      
                      <h3 className={`text-2xl font-black mb-3 line-clamp-2 leading-tight ${isLive ? 'text-white' : 'text-gray-900'}`}>
                        {event.title}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className={`flex items-center text-sm font-bold ${isLive ? 'text-white/80' : 'text-gray-500'}`}>
                          <Calendar size={16} className="mr-2 opacity-70" />
                          {new Date(event.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className={`flex items-center text-sm font-bold ${isLive ? 'text-white/80' : 'text-gray-500'}`}>
                          <MapPin size={16} className="mr-2 opacity-70" />
                          <span className="truncate">{event.locationName}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="group flex items-center text-gray-500 font-bold mb-8 hover:text-purple-600 px-4 py-2 rounded-xl transition-all"
            >
              <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-all" /> Back to List
            </button>

            <div className="bg-white rounded-[3rem] shadow-2xl border border-purple-100 overflow-hidden">
              {/* Refined Header */}
              <div className="px-8 py-10 lg:px-12 border-b border-purple-50 bg-slate-50/50">
                 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                         {getEventStatus(selectedEvent.startDate, selectedEvent.endDate, selectedEvent.startTime, selectedEvent.endTime) === 'LIVE' ? (
                            <span className="px-4 py-1.5 bg-rose-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 animate-pulse">
                               Live Now
                            </span>
                         ) : (
                            <span className="px-4 py-1.5 bg-gray-200 text-gray-600 rounded-full text-xs font-black uppercase tracking-widest">
                               {getEventStatus(selectedEvent.startDate, selectedEvent.endDate, selectedEvent.startTime, selectedEvent.endTime)}
                            </span>
                         )}
                         <span className="text-gray-400 font-bold text-sm tracking-widest uppercase">#{selectedEvent.id}</span>
                      </div>
                      <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-2">
                        {selectedEvent.title}
                      </h2>
                      <div className="flex items-center gap-6 text-gray-600 font-medium">
                         <span className="flex items-center gap-2"><MapPin size={18} className="text-purple-500"/> {selectedEvent.locationName}</span>
                         <span className="flex items-center gap-2"><Clock size={18} className="text-indigo-500"/> {selectedEvent.startTime} - {selectedEvent.endTime}</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl min-w-[240px]">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                         Attendance for {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                       </p>
                       <div className="flex items-end gap-2">
                          <span className="text-5xl font-black text-purple-600">
                            {volunteers.filter(v => v.attendanceRecords?.some(r => r.date === selectedDate && r.status === 'PRESENT')).length}
                          </span>
                          <span className="text-xl font-bold text-gray-400 mb-1">
                            / {volunteers.length}
                          </span>
                       </div>
                       <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                          <div 
                            className="bg-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(volunteers.filter(v => v.attendanceRecords?.some(r => r.date === selectedDate && r.status === 'PRESENT')).length / Math.max(1, volunteers.length)) * 100}%` 
                            }}
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-8 lg:p-12">
                 {/* Empty State / Loading */}
                {vLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                    <p className="text-gray-500 font-medium">Loading roster...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Daily Summary Row */}
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Calendar size={20} className="text-purple-600" />
                          <p className="font-bold text-slate-700">Select Event Date:</p>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {getEventDates(selectedEvent.startDate, selectedEvent.endDate).map(date => {
                             const isSelected = selectedDate === date;
                             const displayDate = new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                             return (
                                <button
                                   key={date}
                                   onClick={() => setSelectedDate(date)}
                                   className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${
                                      isSelected 
                                         ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100' 
                                         : 'bg-white border-slate-200 text-slate-500 hover:border-purple-200'
                                   }`}
                                >
                                   {displayDate}
                                </button>
                             );
                          })}
                       </div>
                    </div>

                    <div className="space-y-6">
                      {volunteers.map(volunteer => {
                        const eventDates = getEventDates(selectedEvent.startDate, selectedEvent.endDate);
                        const isLive = getEventStatus(selectedEvent.startDate, selectedEvent.endDate, selectedEvent.startTime, selectedEvent.endTime) === 'LIVE';

                        return (
                          <div 
                            key={volunteer.id}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                          >
                             <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-6">
                               <div className="flex items-center gap-4">
                                 <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center font-bold text-xl text-purple-600 border border-purple-100">
                                    {volunteer.volunteer?.name?.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-bold text-gray-900 text-lg leading-tight">{volunteer.volunteer?.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {volunteer.volunteer?.userId || volunteer.volunteer?.id}</p>
                                       <span className="text-gray-200">|</span>
                                       
                                       {(() => {
                                          const totalDays = getEventDates(selectedEvent.startDate, selectedEvent.endDate).length;
                                          const presentDays = volunteer.attendanceRecords?.filter(r => r.status === 'PRESENT').length || 0;
                                          const percentage = Math.round((presentDays / totalDays) * 100);
                                          
                                          return (
                                             <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${percentage >= 75 ? 'text-emerald-500' : percentage >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                   {percentage}% Present ({presentDays}/{totalDays} Days)
                                                </span>
                                             </div>
                                          );
                                       })()}
                                    </div>
                                 </div>
                               </div>

                                 <div className="flex-1 flex flex-wrap items-center justify-end gap-3">
                                  {(() => {
                                    const isAttended = volunteer.attendanceRecords?.some(r => r.date === selectedDate && r.status === 'PRESENT');
                                    const isUpdating = updating[`${volunteer.id}-${selectedDate}`];
                                    const eventStatus = getEventStatus(
                                      selectedEvent.startDate,
                                      selectedEvent.endDate,
                                      selectedEvent.startTime,
                                      selectedEvent.endTime,
                                      selectedEvent.status
                                    );
                                    const isLocked = eventStatus !== 'LIVE' || selectedEvent.status === 'COMPLETED';
                                    const lockReason = eventStatus === 'UPCOMING' ? 'Not Started' : 'Completed';

                                    return (
                                      <button
                                        onClick={() => toggleAttendance(volunteer, selectedDate)}
                                        disabled={isUpdating || isLocked}
                                        className={`flex items-center gap-4 px-8 py-4 rounded-2xl border-2 transition-all min-w-[200px] justify-between ${
                                          isAttended
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                            : isLocked 
                                              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                                              : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200 hover:text-purple-500'
                                        } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                                      >
                                        <div className="flex flex-col items-start">
                                          <span className="text-sm font-black uppercase tracking-widest">
                                            {isAttended ? 'Present' : 'Absent'}
                                          </span>
                                          {isLocked && <span className="text-[9px] font-bold opacity-60 uppercase">{lockReason}</span>}
                                        </div>
                                        {isUpdating ? (
                                          <Loader2 size={24} className="animate-spin text-purple-600" />
                                        ) : isAttended ? (
                                          <CheckCircle size={28} className="text-emerald-500" />
                                        ) : (
                                          <XCircle size={28} className={`${isLocked ? 'opacity-10' : 'opacity-20'}`} />
                                        )}
                                      </button>
                                    );
                                  })()}
                               </div>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
