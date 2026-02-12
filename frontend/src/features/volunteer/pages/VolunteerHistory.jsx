import React, { useState, useEffect } from 'react';
import { useApi } from '../../../useApi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { Calendar, MapPin, Clock, Award, Search, ChevronRight, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import CertificateModal from '../components/CertificateModal';

const VolunteerHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [selectedEventForCert, setSelectedEventForCert] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await apiCall(`/volunteers/history?volunteerId=${user.userId}`);
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchHistory();
    }
  }, [user?.userId, apiCall]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-16">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-600 font-medium">Fetching your volunteer history...</p>
      </div>
    );
  }

  const completedEvents = history.filter(h => h.status === 'ATTENDED').length;
  const totalHours = completedEvents * 4;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
              My Participation <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">History</span>
            </h1>
            <p className="text-lg text-gray-600 font-medium">Track your impact and upcoming engagements</p>
          </div>
          
          <div className="flex bg-white rounded-3xl p-2 shadow-xl shadow-gray-200/50 border border-gray-100">
             <div className="px-8 py-3 border-r border-gray-100 text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Events</p>
                <p className="text-3xl font-black text-emerald-600">{history.length}</p>
             </div>
             <div className="px-8 py-3 text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Impact Hours</p>
                <p className="text-3xl font-black text-blue-600">{totalHours}</p>
             </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-10 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Event Details</th>
                  <th className="px-10 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Date & Time</th>
                  <th className="px-10 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-10 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Points</th>
                  <th className="px-10 py-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-all duration-300 group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-sm transition-transform group-hover:scale-105 duration-300 ${
                          item.status === 'ATTENDED' ? 'from-emerald-500 to-green-500 text-white' :
                          item.status === 'APPROVED' ? 'from-blue-500 to-indigo-500 text-white' :
                          'from-gray-200 to-slate-200 text-gray-500'
                        }`}>
                          {item.status === 'ATTENDED' ? <Award size={28} /> : 
                           item.status === 'APPROVED' ? <Calendar size={28} /> : 
                           <Clock size={28} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{item.event.title}</p>
                          <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-1.5">
                            <MapPin size={14} className="text-emerald-500" /> {item.event.locationName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center md:text-left">
                      <div className="inline-block px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="font-bold text-gray-800">{new Date(item.event.startDate || item.event.dateTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter flex items-center justify-center md:justify-start gap-1">
                          <Clock size={10} /> 9:00 AM – 1:00 PM
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm ${
                        item.status === 'ATTENDED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        item.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        item.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${
                          item.status === 'ATTENDED' ? 'bg-emerald-500' :
                          item.status === 'APPROVED' ? 'bg-blue-500' :
                          item.status === 'PENDING' ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <p className={`text-xl font-black ${item.status === 'ATTENDED' ? 'text-emerald-600' : 'text-gray-300'}`}>
                          {item.status === 'ATTENDED' ? '+100' : '0'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">PTS</p>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'ATTENDED' && (
                          <button
                            onClick={() => {
                              setSelectedEventForCert(item.event);
                              setIsCertModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center p-3 hover:bg-emerald-600 rounded-2xl text-emerald-600 hover:text-white transition-all duration-300 border border-emerald-100 hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-200"
                            title="View Certificate"
                          >
                            <FileText size={20} />
                          </button>
                        )}
                        <Link 
                          to={`/volunteer/events/${item.event.id}`}
                          className="inline-flex items-center justify-center p-3 hover:bg-blue-600 rounded-2xl text-gray-400 hover:text-white transition-all duration-300 border border-gray-100 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200 group-hover:translate-x-1"
                        >
                          <ChevronRight size={24} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {history.length === 0 && (
            <div className="text-center py-24 bg-gray-50/50">
              <div className="bg-white w-24 h-24 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-200" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Activities Not Found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-10">You haven't participated in any events yet. Join your first mission today!</p>
              <Link to="/volunteer/events" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200">
                Explore Events
              </Link>
            </div>
          )}
        </div>
      </div>

      <CertificateModal 
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        volunteerName={user?.name}
        event={selectedEventForCert}
      />
    </div>
  );
};

export default VolunteerHistory;