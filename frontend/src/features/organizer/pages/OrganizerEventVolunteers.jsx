import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useApi } from "../../../useApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { CheckCircle, XCircle, Loader2, User, Calendar, MapPin, Users, Eye, Mail, Award, Clock, Star, X } from "lucide-react";

export default function OrganizerEventVolunteers() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const [volunteers, setVolunteers] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState({});
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVolunteers();
    fetchEvent();
  }, [eventId]);

  const fetchVolunteers = async () => {
    try {
      const data = await apiCall(`/events/${eventId}/volunteers`);
      setVolunteers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvent = async () => {
    try {
      const data = await apiCall(`/events/details/${eventId}`);
      setEvent(data);
    } catch (err) {
      console.error(err);
    }
  };

  const { user: authUser } = useAuth(); // Assume it exports user or authUser

  const approveVolunteer = async (requestId) => {
    setApproving(prev => ({ ...prev, [requestId]: true }));
    try {
      await apiCall(`/volunteers/${requestId}/approve?organizerId=${authUser?.userId}`, { 
        method: "PATCH" 
      });
      await fetchVolunteers();
    } catch (err) {
      console.error(err);
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
      await fetchVolunteers();
    } catch (err) {
      console.error(err);
      alert("Failed to reject: " + err.message);
    } finally {
      setApproving(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const removeVolunteer = async (requestId) => {
    if (!window.confirm("Remove this volunteer from event?")) return;
    try {
      await apiCall(`/volunteers/${requestId}/remove?organizerId=${authUser?.userId}`, { 
        method: "PATCH" 
      });
      await fetchVolunteers();
    } catch (err) {
      console.error(err);
      alert("Failed to remove: " + err.message);
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
      await fetchVolunteers();
    } catch (err) {
      console.error(err);
      alert("Failed to issue certificate: " + err.message);
    }
  };

  const handleViewProfile = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowModal(true);
  };

  if (loading) {
    return <Loader2 className="animate-spin w-12 h-12 mx-auto mt-20" />;
  }

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/organizer/events"
          className="inline-flex items-center px-6 py-3 mb-8 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all border border-purple-200 hover:border-purple-300 shadow-sm text-purple-700 font-medium"
        >
          ← Back to Events
        </Link>

        {/* Event Header */}
        {event && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-purple-200 shadow-2xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {event.title}
                </h1>
                <p className="text-xl text-gray-600 mt-2">{event.locationName}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4 text-lg font-bold">
                  <div className="flex items-center space-x-1 text-green-600">
                    <Users size={20} />
                    <span>{volunteers.filter(v => v.status === 'APPROVED').length}/{event.requiredVolunteers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Volunteers Table */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-purple-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <Users size={24} className="text-purple-600" />
              <span>Volunteer Requests ({volunteers.length})</span>
            </h2>
          </div>

          {volunteers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No volunteers have joined this event yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Volunteer</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {volunteers.map((v) => (
                    <tr key={v.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{v.volunteer?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{v.volunteer?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-gray-600">
                          {new Date(v.joinedAt).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          v.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                          v.status === 'ATTENDED' ? 'bg-indigo-100 text-indigo-700' :
                          v.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {v.status}
                        </span>
                        {v.feedback && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            Has Feedback ({v.rating}/5)
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleViewProfile(v)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="View Profile"
                          >
                            <Eye size={20} />
                          </button>
                          {v.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => approveVolunteer(v.id)}
                                disabled={approving[v.id]}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-1 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                              >
                                {approving[v.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle size={16} />}
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                              <button
                                onClick={() => rejectVolunteer(v.id)}
                                disabled={approving[v.id]}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-1 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                              >
                                {approving[v.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle size={16} />}
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            </>
                          )}
                          {v.status === 'APPROVED' && (
                            <button
                              onClick={() => removeVolunteer(v.id)}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-1 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <XCircle size={16} />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          )}
                          {v.status === 'ATTENDED' && (
                             <button
                               onClick={() => issueCertificate(v.id)}
                               className={`px-4 py-2 rounded-xl font-medium flex items-center space-x-1 shadow-md hover:shadow-lg transition-all duration-200 ${
                                 v.certificateUrl 
                                   ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default' 
                                   : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                               }`}
                               disabled={!!v.certificateUrl}
                             >
                               <Award size={16} />
                               <span className="hidden sm:inline">{v.certificateUrl ? 'Issued' : 'Give Certificate'}</span>
                             </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showModal && selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative h-32 ">
               <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"
               >
                 <X  type="button" className="text-blue-600" size={20} />
               </button>
            </div>
            
            <div className="px-8 pb-8 -mt-12 text-center">
              <div className="inline-block p-1 bg-white rounded-full shadow-xl mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center text-white">
                  <User size={48} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedVolunteer.volunteer?.name}</h3>
              <p className="text-purple-600 font-bold text-sm uppercase tracking-widest mb-6">Verified Volunteer</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <Mail className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Email</p>
                   <p className="text-sm font-bold text-slate-700 truncate">{selectedVolunteer.volunteer?.email}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                   <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Joined</p>
                   <p className="text-sm font-bold text-slate-700">{new Date(selectedVolunteer.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-left mb-8">
                <h4 className="flex items-center gap-2 text-purple-800 font-bold mb-3">
                  <Award size={18} /> Experience & Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                   {['Communication', 'Teamwork', 'Punctuality'].map(skill => (
                     <span key={skill} className="px-3 py-1 bg-white border border-purple-200 rounded-lg text-xs font-bold text-purple-600 shadow-sm">
                       {skill}
                     </span>
                   ))}
                </div>
              </div>

              {selectedVolunteer.feedback && (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-left mb-8">
                  <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-3 italic">
                    <Star size={18} className="fill-amber-400 text-amber-400" /> Volunteer's Feedback ({selectedVolunteer.rating}/5)
                  </h4>
                  <p className="text-amber-900 font-medium italic">"{selectedVolunteer.feedback}"</p>
                </div>
              )}

              <div className="flex gap-4">
                {selectedVolunteer.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => { approveVolunteer(selectedVolunteer.id); setShowModal(false); }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      Approve Applicant
                    </button>
                    <button 
                      onClick={() => { rejectVolunteer(selectedVolunteer.id); setShowModal(false); }}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-2xl font-bold transition-all"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl font-bold transition-all"
                  >
                    Close Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
