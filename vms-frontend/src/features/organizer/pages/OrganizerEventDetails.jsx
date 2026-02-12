import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  Calendar, MapPin, Users, Tag, CheckCircle, Clock, 
  ArrowLeft, Edit3, Trash2, Eye, User, CheckCircle2, XCircle, Loader2,
  Info, BarChart3, Users2, XOctagon, Send, Award, Star
} from 'lucide-react';
import { getEventStatus } from '../../../utils/formatters';

export default function OrganizerEventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const { user: authUser } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState({});

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const [eventData, volunteerData] = await Promise.all([
        apiCall(`/events/details/${eventId}`),
        apiCall(`/events/${eventId}/volunteers`)
      ]);
      setEvent(eventData);
      setVolunteers(volunteerData || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch event data');
    } finally {
      setLoading(false);
    }
  };

  const approveVolunteer = async (requestId) => {
    setApproving(prev => ({ ...prev, [requestId]: true }));
    try {
      await apiCall(`/volunteers/${requestId}/approve?organizerId=${authUser?.userId}`, { 
        method: "PATCH" 
      });
      fetchEventData();
    } catch (err) {
      alert("Failed to approve: " + err.message);
    } finally {
      setApproving(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const rejectVolunteer = async (requestId) => {
    const reason = window.prompt("Reason for rejection:", "Not suitable for this role");
    if (reason === null) return;
    
    setApproving(prev => ({ ...prev, [requestId]: true }));
    try {
      await apiCall(`/volunteers/${requestId}/reject?organizerId=${authUser?.userId}&reason=${encodeURIComponent(reason)}`, { 
        method: "PATCH" 
      });
      fetchEventData();
    } catch (err) {
      alert("Failed to reject: " + err.message);
    } finally {
      setApproving(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleCancelEvent = async () => {
    const reason = window.prompt("Please enter the reason for cancellation (this will be shown to volunteers):");
    if (reason === null) return; // Cancelled prompt
    if (!reason.trim()) {
        alert("Cancellation reason is required.");
        return;
    }

    if (!window.confirm("Are you sure you want to cancel this event? This action cannot be undone.")) return;

    try {
        await apiCall(`/events/${event.id}/cancel?userId=${authUser.userId}&reason=${encodeURIComponent(reason)}`, { method: 'PATCH' });
        fetchEventData();
    } catch (err) {
        alert("Failed to cancel event: " + err.message);
    }
  };

  const issueCertificate = async (registrationId) => {
    const certUrl = window.prompt("Enter Certificate URL (e.g., a PDF link):", `https://vms.com/certificates/${registrationId}`);
    if (!certUrl) return;

    try {
      await apiCall(`/volunteers/${registrationId}/certificate?organizerId=${authUser?.userId}&certificateUrl=${encodeURIComponent(certUrl)}`, { 
        method: "POST" 
      });
      alert("Certificate issued successfully!");
      fetchEventData();
    } catch (err) {
      alert("Failed to issue certificate: " + err.message);
    }
  };

  const handlePublish = async () => {
    try {
      if (!window.confirm("Are you sure you want to publish this event? It will be visible to volunteers.")) return;
      await apiCall(`/events/${event.id}/publish?userId=${authUser.userId}`, { method: 'PATCH' });
      fetchEventData();
    } catch (err) {
      alert("Failed to publish: " + err.message);
    }
  };

  const allFeedbacks = React.useMemo(() => {
    if (!Array.isArray(volunteers)) return [];
    const collected = [];
    volunteers.forEach(v => {
      if (v.feedbacks && Array.isArray(v.feedbacks)) {
        v.feedbacks.forEach(f => {
          collected.push({
            ...f,
            volunteerName: v.volunteer?.name || 'Anonymous',
            volunteerEmail: v.volunteer?.email || ''
          });
        });
      }
    });
    // Sort by most recent first
    return collected.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [volunteers]);

  const averageRating = React.useMemo(() => {
    if (allFeedbacks.length === 0) return "0.0";
    const sum = allFeedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return (sum / allFeedbacks.length).toFixed(1);
  }, [allFeedbacks]);

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to remove this feedback from public view?')) return;
    try {
      await apiCall(`/volunteers/feedback/${feedbackId}/moderate?organizerId=${authUser.userId}`, {
        method: 'DELETE'
      });
      alert('Feedback removed successfully');
      fetchEventData();
    } catch (err) {
      console.error('Failed to remove feedback:', err);
      alert('Failed to remove feedback: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
          <p className="text-xl text-gray-600 font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8 pt-24 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Occurred</h2>
          <p className="text-gray-600 mb-8">{error || 'Event not found'}</p>
          <Link to="/organizer/events" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all">
            <ArrowLeft size={18} /> Back to My Events
          </Link>
        </div>
      </div>
    );
  }

  const approvedCount = volunteers.filter(v => v.status === 'APPROVED' || v.status === 'ATTENDED').length;
  const pendingCount = volunteers.filter(v => v.status === 'PENDING').length;

  const isAdmin = authUser?.role === 'ADMIN';

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(isAdmin ? '/admin/events' : '/organizer/events')}
              className="p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-purple-200 hover:bg-white transition-all shadow-sm text-purple-700 font-bold group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {isAdmin ? 'Admin View' : 'Overview'}
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mt-1">ID: #{event.id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {(() => {
                const status = getEventStatus(
                  event.startDate, 
                  event.endDate, 
                  event.startTime, 
                  event.endTime, 
                  event.status
                );
                
                const isCancellable = status !== 'CANCELLED' && status !== 'COMPLETED';
                const isEditable = status === 'DRAFT' || status === 'PENDING_APPROVAL' || status === 'UPCOMING' || status === 'REJECTED';
                
                return (
                  <>
                    {event.status === 'DRAFT' && !isAdmin && (
                      <button 
                        onClick={handlePublish}
                        className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all"
                      >
                        <Send size={18} /> Publish
                      </button>
                    )}

                    {status !== 'CANCELLED' && (
                      isCancellable ? (
                        <button 
                          onClick={handleCancelEvent}
                          className="px-6 py-3.5 bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200 rounded-2xl font-bold flex items-center gap-2 transition-all"
                        >
                          <XOctagon size={18} /> Cancel
                        </button>
                      ) : (
                        <div 
                          title="Event has ended - Cancellation disabled"
                          className="px-6 py-3.5 bg-gray-50 border border-gray-200 text-gray-400 rounded-2xl font-bold flex items-center gap-2 cursor-not-allowed opacity-60"
                        >
                          <XOctagon size={18} /> Cancel
                        </div>
                      )
                    )}

                    {isEditable ? (
                      <Link 
                        to={isAdmin ? `/admin/events/${event.id}/edit` : `/organizer/events/${event.id}/edit`}
                        className="flex items-center gap-2 px-6 py-3.5 bg-white border border-purple-200 text-purple-700 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-50 transition-all shadow-sm group"
                      >
                        <Edit3 size={18} className="transition-transform group-hover:scale-110" />
                        <span>Edit</span>
                      </Link>
                    ) : (
                      <div 
                        title="Event has started/ended - Edit disabled"
                        className="flex items-center gap-2 px-6 py-3.5 bg-gray-50 border border-gray-200 text-gray-400 rounded-2xl font-black uppercase tracking-widest cursor-not-allowed opacity-60"
                      >
                        <Edit3 size={18} />
                        <span>Edit</span>
                      </div>
                    )}
                  </>
                );
             })()}
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Core Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-purple-100 p-8 lg:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Calendar size={120} className="text-purple-600" />
              </div>
              
              <div className="relative">
                <div className="flex flex-wrap gap-2 mb-6">
                  {/* Status Badge */}
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                     event.status === 'CANCELLED' ? 'bg-red-100 text-red-700 decoration-red-900' :
                     event.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                     event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-gray-100 text-gray-700'
                  }`}>
                    {event.status}
                  </span>
                  <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-black uppercase tracking-widest">
                    {event.category}
                  </span>
                </div>

                <h2 className={`text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight ${event.status === 'CANCELLED' ? 'line-through decoration-red-300 opacity-60' : ''}`}>
                  {event.title}
                </h2>
                
                {event.status === 'CANCELLED' && event.cancellationReason && (
                   <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                      <Info className="text-red-500 mt-1 shrink-0" size={20} />
                      <div>
                         <p className="font-black text-red-800 uppercase text-xs tracking-widest mb-1">Cancellation Reason</p>
                         <p className="text-red-900 font-medium">{event.cancellationReason}</p>
                      </div>
                   </div>
                )}

                <p className="text-xl text-gray-600 leading-relaxed mb-10 font-medium">
                  {event.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-start gap-4 p-5 rounded-3xl bg-purple-50/50 border border-purple-100 group/item">
                    <div className="p-4 bg-white rounded-2xl shadow-md group-hover/item:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-purple-400 capitalize tracking-widest mb-1">Schedule</p>
                      <p className="text-lg font-black text-gray-900 leading-tight">
                        {new Date(event.startDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm font-bold text-gray-500 mt-1">
                        Ends: {new Date(event.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-3xl bg-indigo-50/50 border border-indigo-100 group/item">
                    <div className="p-4 bg-white rounded-2xl shadow-md group-hover/item:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-indigo-400 capitalize tracking-widest mb-1">Timing</p>
                      <p className="text-lg font-black text-gray-900 leading-tight">
                        {event.startTime} - {event.endTime}
                      </p>
                      <p className="text-sm font-bold text-gray-500 mt-1 italic">Please arrive 15 min early</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-3xl bg-emerald-50/50 border border-emerald-100 group/item">
                    <div className="p-4 bg-white rounded-2xl shadow-md group-hover/item:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-400 capitalize tracking-widest mb-1">Venue</p>
                      <p className="text-lg font-black text-gray-900 leading-tight">
                        {event.locationName}
                      </p>
                      <p className="text-sm font-bold text-gray-500 mt-1">{event.city}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Summary */}
          <div className="space-y-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-purple-100 p-8">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <BarChart3 className="text-purple-600" />
                Participation Stats
              </h3>
              
              <div className="space-y-6">
                <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-1000"
                    style={{ width: `${Math.min(100, (approvedCount / event.requiredVolunteers) * 100)}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-emerald-100">
                    <p className="text-3xl font-black text-emerald-600">{approvedCount}</p>
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mt-1">Accepted</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl border border-amber-100">
                    <p className="text-3xl font-black text-amber-600">{pendingCount}</p>
                    <p className="text-xs font-black text-amber-400 uppercase tracking-widest mt-1">Pending</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border border-indigo-100">
                    <p className="text-3xl font-black text-indigo-600">{volunteers.filter(v => v.status === 'ATTENDED').length}</p>
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mt-1">Present</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100">
                    <p className="text-3xl font-black text-amber-600">
                      {averageRating}
                    </p>
                    <p className="text-xs font-black text-amber-400 uppercase tracking-widest mt-1">Avg Rating</p>
                  </div>
                </div>

                <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">Total Feedbacks</p>
                    <p className="text-2xl font-black text-purple-900">{allFeedbacks.length} Reviews</p>
                  </div>
                  <Star className="w-10 h-10 text-purple-200 fill-purple-200" />
                </div>

                {/* Relocated Quota/Capacity Info */}
                <div className="p-6 bg-pink-50 rounded-3xl border border-pink-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-pink-400 uppercase tracking-widest mb-1">Total Capacity</p>
                      <p className="text-2xl font-black text-pink-900">{event.requiredVolunteers} Spots</p>
                    </div>
                    <Users className="w-10 h-10 text-pink-200 fill-pink-200" />
                </div>
              </div>
            </div>

            {/* <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] shadow-2xl shadow-indigo-200 p-8 text-white relative overflow-hidden group">
               <div className="relative z-10">
                <h3 className="text-xl font-black mb-6">Quick Tools</h3>
                <div className="space-y-4">
                  <Link 
                    to={`/organizer/events/${event.id}/volunteers`}
                    className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all group/btn"
                  >
                    <span className="font-bold">Member Directory</span>
                    <Users2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </Link>
                   <Link 
                    to={`/organizer/attendance?eventId=${event.id}`}
                    className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all group/btn"
                  >
                    <span className="font-bold">Presence Tracker</span>
                    <CheckCircle2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </Link>
                </div>
               </div>
               <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform">
                <BarChart3 size={200} />
               </div>
            </div> */}
          </div>
        </div>

        {/* Volunteer List - Bottom Section */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-purple-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-purple-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Users2 className="text-purple-600" />
              Member Roster
            </h2>
            <Link 
              to={`/organizer/events/${event.id}/volunteers`}
              className="text-purple-600 font-black uppercase tracking-widest text-sm hover:underline"
            >
              Manage All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-10 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Volunteer</th>
                  <th className="px-10 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Application</th>
                  <th className="px-10 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {volunteers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-10 py-20 text-center">
                      <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold text-lg">No join requests yet</p>
                    </td>
                  </tr>
                ) : (
                  volunteers.slice(0, 10).map((v) => (
                    <tr key={v.id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                            {(v.volunteer?.name || 'V').charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{v.volunteer?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{v.volunteer?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm font-bold text-gray-500">
                          {new Date(v.joinedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-black text-gray-300 uppercase mt-0.5">Application Date</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          v.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          v.status === 'ATTENDED' ? 'bg-indigo-100 text-indigo-700' :
                          v.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {v.status}
                        </span>
                        {v.feedbacks && v.feedbacks.length > 0 && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            {v.feedbacks.length} Feedback(s)
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-right">
                          {v.status === 'PENDING' ? (
                            <>
                              <button 
                                onClick={() => approveVolunteer(v.id)}
                                disabled={approving[v.id]}
                                className="p-2.5 rounded-xl bg-white border border-gray-100 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                                title="Approve"
                              >
                                {approving[v.id] ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                              </button>
                              <button 
                                onClick={() => rejectVolunteer(v.id)}
                                disabled={approving[v.id]}
                                className="p-2.5 rounded-xl bg-white border border-gray-100 text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                                title="Reject"
                              >
                                 {approving[v.id] ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                to={`/organizer/events/${event.id}/volunteers`}
                                className="p-2.5 rounded-xl bg-white border border-gray-100 text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                              >
                                <Eye className="w-5 h-5" />
                              </Link>
                              {v.status === 'ATTENDED' && (
                                <button 
                                  onClick={() => issueCertificate(v.id)}
                                  disabled={!!v.certificateUrl}
                                  className={`p-2 rounded-xl border transition-all shadow-sm flex items-center gap-1 ${
                                    v.certificateUrl 
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600 opacity-70' 
                                      : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50'
                                  }`}
                                  title={v.certificateUrl ? "Certificate Issued" : "Give Certificate"}
                                >
                                  <Award className="w-5 h-5" />
                                  <span className="text-[10px] font-black uppercase whitespace-nowrap">{v.certificateUrl ? 'Issued' : 'Award'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {volunteers.length > 10 && (
              <div className="p-8 text-center bg-gray-50/50">
                <Link to={`/organizer/events/${event.id}/volunteers`} className="text-purple-600 font-black uppercase tracking-widest text-sm hover:underline">
                  View Remaining {volunteers.length - 10} Applicants →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Volunteer Testimonials List */}
        <div className="mt-12 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-purple-100 overflow-hidden">
          <div className="px-10 py-8 border-b border-purple-100 bg-gradient-to-r from-purple-50/50 to-transparent">
            <h2 className="text-2xl font-black text-gray-900 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Star className="text-amber-500 fill-amber-500" />
                Volunteer Testimonials
              </div>
              <div className="text-xs px-4 py-2 bg-purple-100 text-purple-700 rounded-2xl font-black uppercase tracking-widest border border-purple-200">
                Feedback for: {event?.title || 'Unknown Event'}
              </div>
            </h2>
          </div>
          
          <div className="p-8 lg:p-10">
            {allFeedbacks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {allFeedbacks.map((f) => (
                  <div key={f.id} className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 hover:border-purple-200 transition-all group relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-purple-200/30 transition-colors" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg transition-transform">
                          {f.volunteerName?.charAt(0).toUpperCase()}
                        </div>  
                        <div>
                          <p className="font-black text-gray-900 text-lg leading-tight">{f.volunteerName || 'Anonymous'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock size={12} className="text-gray-400" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(f.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={16} 
                              className={`${star <= (f.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                        <button 
                          onClick={() => handleDeleteFeedback(f.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors border border-rose-100"
                          title="Remove Feedback"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-gray-600 font-medium italic leading-relaxed text-lg lg:text-xl">
                        "{f.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Star className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-bold">No testimonials submitted yet for this event.</p>
                <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-black">Once volunteers share their reviews, they will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
