import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { 
  User, Mail, Phone, Shield, ArrowLeft, Calendar, MapPin, 
  Clock, Tag, Users, Eye, ExternalLink, Briefcase, Award,
  CheckCircle2, Loader2, AlertCircle
} from 'lucide-react';

export default function AdminOrganizerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const result = await apiCall(`/users/organizer/${id}/details`);
      setData(result);
    } catch (err) {
      console.error('Fetch organizer details error:', err);
      setError('Failed to load organizer details. They might not exist.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin w-12 h-12 text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading partner profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-rose-50">
           <AlertCircle className="w-16 h-16 text-rose-300 mx-auto mb-4" />
           <h2 className="text-2xl font-black text-gray-900 mb-2">Error Occurred</h2>
           <p className="text-gray-500 mb-6">{error || "Could not retrieve details."}</p>
           <button onClick={() => navigate('/admin/organizers')} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
              Back to Organizers
           </button>
        </div>
      </div>
    );
  }

  const { organizer, events } = data;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/admin/organizers')}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Organizers
      </button>

      {/* Header Section */}
      <div className="relative mb-12">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-indigo-50 border-b-4 border-b-indigo-500">
           <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-5xl shadow-inner">
                {organizer.name?.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">{organizer.name}</h1>
                  <span className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Partner
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-500 font-bold">
                  <span className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-400" />
                    {organizer.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-indigo-400" />
                    {organizer.number || 'No contact number'}
                  </span>
                  <span className="flex items-center gap-2 text-amber-600">
                    <Award className="w-5 h-5" />
                    ID: {organizer.vmsId || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 text-center min-w-[160px]">
                <p className="text-4xl font-black text-indigo-600 mb-1">{events.length}</p>
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Total Events</p>
              </div>
           </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-indigo-50 overflow-hidden">
        <div className="p-8 border-b border-indigo-50 bg-indigo-50/30 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-indigo-500" />
            Events Created
          </h2>
        </div>

        {events.length === 0 ? (
          <div className="p-20 text-center">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-400">This organizer hasn't created any events yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Event Details</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Volunteers</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          <Tag className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{event.title}</p>
                          <p className="text-sm font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.city}, {event.area}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="font-bold text-gray-900">{new Date(event.dateTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                        {new Date(event.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black border border-blue-100">
                          <Users className="w-3.5 h-3.5" />
                          {event.currentVolunteers} / {event.requiredVolunteers}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        event.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        event.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-gray-50 text-gray-600 border-gray-100'
                      }`}>
                        {event.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Link 
                        to={`/organizer/events/${event.id}`} 
                        className="inline-flex items-center justify-center p-3 bg-white text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                        title="View Volunteers"
                      >
                         <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
