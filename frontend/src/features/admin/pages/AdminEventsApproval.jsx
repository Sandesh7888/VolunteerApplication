import React, { useEffect, useState } from "react";
import { useApi } from "../../../useApi";
import { CheckCircle, XCircle, Loader2, Calendar, MapPin, Eye, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminEventsApproval() {
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/admin/events/pending");
      setEvents(data || []);
    } catch (err) {
      console.error("Fetch pending error:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (id) => {
    try {
      await apiCall(`/admin/events/${id}/approve`, { method: "PATCH" });
      setEvents(events.filter(e => e.id !== id));
      alert("✅ Event Approved!");
    } catch (err) {
      console.error("Approve error:", err);
      alert("❌ Error: " + (err.message || "Failed to approve event"));
    }
  };

  const rejectEvent = async (id) => {
    if (!confirm("Are you sure you want to reject this event?")) return;
    try {
      await apiCall(`/admin/events/${id}/reject`, { method: "PATCH" });
      setEvents(events.filter(e => e.id !== id));
      alert("❌ Event Rejected");
    } catch (err) {
      console.error("Reject error:", err);
      alert("❌ Error: " + (err.message || "Failed to reject event"));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin w-12 h-12 text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Approval</h1>
        <p className="text-gray-600 font-medium">Review and manage pending event submissions ({events.length})</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-12 text-center">
          <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">There are no pending events waiting for approval.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl shadow-sm border border-indigo-50 border-l-4 border-l-amber-400 p-6 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Pending
                    </span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-500 text-sm font-medium">{e.category}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{e.title}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium">
                        {e.startDate ? new Date(e.startDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Date TBD'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium">{e.startTime || 'Time TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium truncate">{e.locationName || e.city || 'Location TBD'}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                      {(e.organizer?.name || 'O').charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Organizer: <span className="text-gray-900 font-bold">{e.organizer?.name || 'Unknown'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:self-center">
                  <button
                    onClick={() => navigate(`/admin/events/${e.id}`)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => approveEvent(e.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectEvent(e.id)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
