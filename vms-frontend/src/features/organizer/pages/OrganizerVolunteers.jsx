import React, { useState, useEffect } from 'react';
import { useApi } from '../../../useApi';
import { useAuth } from "../../auth/hooks/useAuth";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Filter,
  Mail,
  Calendar,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrganizerVolunteers() {
  const { apiCall } = useApi();
  const { user: authUser } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchEvents();
  }, [authUser?.userId]);

  const fetchEvents = async () => {
    try {
      const myEvents = await apiCall('/events/myevents');
      setEvents(myEvents || []);

      if (myEvents?.length > 0 && !selectedEvent) {
        setSelectedEvent(myEvents[0]);
        fetchVolunteers(myEvents[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async (eventId) => {
    try {
      const result = await apiCall(`/events/${eventId}/volunteers`);
      setVolunteers(result || []);
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
      setVolunteers([]);
    }
  };

  const handleAction = async (participantId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this volunteer?`)) return;
    
    setActionLoading(prev => ({ ...prev, [participantId]: true }));
    try {
      const organizerId = authUser?.userId;
      const endpoint = action === 'delete' ? 'remove' : action === 'accept' ? 'approve' : 'reject';
      
      let url = `/volunteers/${participantId}/${endpoint}?organizerId=${organizerId}`;
      if (action === 'reject') {
        const reason = window.prompt("Reason for rejection (optional):", "Not suitable for this role");
        if (reason) url += `&reason=${encodeURIComponent(reason)}`;
      }

      await apiCall(url, { method: 'PATCH' });
      await fetchVolunteers(selectedEvent.id);
      await fetchEvents(); // Refresh counts
    } catch (error) {
      alert("Action failed: " + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [participantId]: false }));
    }
  };

  const filteredVolunteers = volunteers.filter(v => {
    if (filterStatus === 'ALL') return true;
    return v.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'REJECTED': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'ATTENDED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Volunteer Management</h1>
            <p className="text-slate-500 font-medium">Review applications and manage attendance</p>
          </div>
          <Link to="/organizer/create-event" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2">
            <Calendar size={18} /> Create Event
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT: Event List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Select Event</h3>
            <div className="space-y-3">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => { setSelectedEvent(event); fetchVolunteers(event.id); }}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    selectedEvent?.id === event.id 
                      ? 'bg-white border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <h4 className={`font-bold truncate mb-1 ${selectedEvent?.id === event.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {event.title}
                  </h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{new Date(event.startDate).toLocaleDateString()}</span>
                    {event.pendingCount > 0 && (
                      <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                        {event.pendingCount} new
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {events.length === 0 && (
                <div className="text-center p-8 bg-slate-100 rounded-2xl border border-dashed border-slate-300 text-slate-500 font-medium text-sm">
                  No events found
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Volunteer List */}
          <div className="lg:col-span-3">
            {selectedEvent ? (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[600px]">
                
                {/* Filters */}
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <Users className="text-indigo-500" />
                    <span>{selectedEvent.title}</span>
                    <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{volunteers.length}</span>
                  </h2>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    {['ALL', 'PENDING', 'APPROVED', 'ATTENDED'].map(status => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          filterStatus === status 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                {filteredVolunteers.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-slate-300 w-10 h-10" />
                    </div>
                    <p className="text-slate-500 font-medium">No volunteers found with this status</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredVolunteers.map(volunteer => (
                      <div key={volunteer.id} className="group p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all bg-slate-50/50 hover:bg-white relative">
                        {/* Status Badge */}
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(volunteer.status)}`}>
                          {volunteer.status}
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200">
                            {volunteer.volunteer?.name?.charAt(0) || 'V'}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{volunteer.volunteer?.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                              <Mail size={12} /> {volunteer.volunteer?.email}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-200/50">
                          {volunteer.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => handleAction(volunteer.id, 'accept')}
                                disabled={actionLoading[volunteer.id]}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={14} /> Accept
                              </button>
                              <button 
                                onClick={() => handleAction(volunteer.id, 'reject')}
                                disabled={actionLoading[volunteer.id]}
                                className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {volunteer.status === 'APPROVED' && (
                            <button 
                              onClick={() => handleAction(volunteer.id, 'delete')}
                              className="w-full py-2 text-slate-400 hover:text-rose-500 text-xs font-bold transition-colors border border-dashed border-slate-300 rounded-xl hover:border-rose-200 hover:bg-rose-50"
                            >
                              Remove
                            </button>
                          )}
                          {volunteer.status === 'ATTENDED' && (
                             <div className="w-full py-2 text-center text-xs font-black text-emerald-600 bg-emerald-50 rounded-xl uppercase tracking-wider">
                               Participated
                             </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-slate-100 rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-medium">
                Select an event from the left to manage volunteers
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
