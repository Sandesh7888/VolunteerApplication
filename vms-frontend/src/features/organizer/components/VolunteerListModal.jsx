import React, { useEffect, useState } from "react";
import { useApi } from "../../../useApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { 
  CheckCircle, XCircle, Loader2, User, Calendar, MapPin, 
  Users, Eye, Mail, Award, Clock, Star, X, Upload, ExternalLink 
} from "lucide-react";

export default function VolunteerListModal({ isOpen, onClose, eventId }) {
  const { apiCall } = useApi();
  const { user: authUser } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    if (isOpen && eventId) {
      fetchData();
    }
  }, [isOpen, eventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [volunteersData, eventData] = await Promise.all([
        apiCall(`/events/${eventId}/volunteers`),
        apiCall(`/events/details/${eventId}`)
      ]);
      setVolunteers(volunteersData);
      setEvent(eventData);
    } catch (err) {
      console.error(err);
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
      await fetchData();
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
      await fetchData();
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
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to remove: " + err.message);
    }
  };

  const handleFileUpload = async (registrationId, file) => {
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [registrationId]: true }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizerId", authUser?.userId);

    try {
      await apiCall(`/volunteers/${registrationId}/upload-certificate`, {
        method: "POST",
        body: formData,
        headers: {} // Let browser set multipart boundary
      });
      alert("Certificate uploaded successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-[2.5rem]">
          <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Users className="text-purple-600" size={32} />
              Volunteer Management
            </h2>
            {event && (
              <p className="text-slate-500 font-bold mt-1 ml-11">
                {event.title} • {volunteers.filter(v => v.status === 'APPROVED' || v.status === 'ATTENDED').length}/{event.requiredVolunteers} Filled
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/50 rounded-2xl transition-all text-slate-400 hover:text-rose-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="text-slate-500 font-bold">Fetching volunteers...</p>
            </div>
          ) : volunteers.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <Users className="w-20 h-20 mx-auto mb-4 text-slate-300" />
              <p className="text-xl font-bold text-slate-400">No registrations for this event yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {volunteers.map((v) => (
                <div key={v.id} className="group bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 border border-slate-100 p-6 rounded-3xl transition-all flex items-center gap-6">
                  {/* Volunteer Info */}
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <User size={28} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-slate-900">{v.volunteer?.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm font-bold text-slate-500">
                      <span className="flex items-center gap-1.5"><Mail size={14} className="text-purple-500" /> {v.volunteer?.email}</span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-widest ${
                        v.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                        v.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        v.status === 'ATTENDED' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {v.status}
                      </span>
                    </div>
                  </div>

                  {/* Rating / Feedback Preview */}
                  {v.feedback && (
                    <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 flex items-center gap-2">
                       <Star size={16} className="fill-amber-400 text-amber-400" />
                       <span className="text-amber-800 font-black">{v.rating}/5</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {v.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => approveVolunteer(v.id)}
                          disabled={approving[v.id]}
                          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                        >
                          {approving[v.id] ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          Approve
                        </button>
                        <button
                          onClick={() => rejectVolunteer(v.id)}
                          disabled={approving[v.id]}
                          className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                    
                    {v.status === 'APPROVED' && (
                      <button
                        onClick={() => removeVolunteer(v.id)}
                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                        title="Remove Volunteer"
                      >
                        <XCircle size={20} />
                      </button>
                    )}

                    {v.status === 'ATTENDED' && (
                      <div className="flex items-center gap-3">
                        {v.certificateUrl ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl">
                             <Award size={18} />
                             <span className="text-sm font-black uppercase tracking-widest">Certified</span>
                          </div>
                        ) : (
                          <div className="relative group/upload">
                            <input 
                              type="file"
                              id={`cert-upload-${v.id}`}
                              className="hidden"
                              accept=".pdf"
                              onChange={(e) => handleFileUpload(v.id, e.target.files[0])}
                            />
                            <label
                              htmlFor={`cert-upload-${v.id}`}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
                            >
                              {uploading[v.id] ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                              Issue Certificate
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
