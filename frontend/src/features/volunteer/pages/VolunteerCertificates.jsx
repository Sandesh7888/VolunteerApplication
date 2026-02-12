import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useApi } from '../../../useApi';
import { Award, Calendar, MapPin, Loader2, Download, Search, Eye, ExternalLink } from 'lucide-react';
import CertificateModal from '../components/CertificateModal';

export default function VolunteerCertificates() {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCert, setCurrentCert] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      // Fetch history and filter for ATTENDED events
      const data = await apiCall(`/volunteers/history?volunteerId=${user.userId}`);
      
      const attendedEvents = data.filter(item => 
        item.status === 'ATTENDED' 
      ).map(item => ({
        ...item.event,
        registrationId: item.id,
        certificateUrl: item.certificateUrl,
        feedbacks: item.feedbacks || [] // Ensure feedbacks array exists
      }));

      setCertificates(attendedEvents);
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openPreview = (cert) => {
    if (!cert.feedbacks || cert.feedbacks.length === 0) {
      alert("Please submit feedback for this event (via Event Details) to unlock the certificate.");
      return;
    }
    setCurrentCert(cert);
    setIsCertModalOpen(true);
  };

  const handleDownload = async (cert) => {
    if (!cert.feedbacks || cert.feedbacks.length === 0) {
      alert("Please submit feedback for this event (via Event Details) to unlock the certificate.");
      return;
    }

    if (cert.certificateUrl) {
      if (cert.certificateUrl.startsWith('certificates/')) {
        try {
          const fileName = cert.certificateUrl.split('/').pop();
          const blob = await apiCall(`/volunteers/certificate/download/${fileName}`, {
             method: 'GET',
             responseType: 'blob'
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Download failed: " + err.message);
        }
      } else {
        window.open(cert.certificateUrl, '_blank');
      }
    } else {
      setCurrentCert(cert);
      setIsCertModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center pt-20">
         <div className="text-center">
             <Loader2 className="animate-spin text-emerald-600 w-12 h-12 mx-auto mb-4" />
             <p className="text-xl text-gray-600 font-medium">Loading certificates...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-2">
      <div className="max-w-7xl mx-auto">
        {/* Header - Matches My Events Style */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white/40 p-6 rounded-[2.5rem] border border-white/60 backdrop-blur-sm shadow-xl shadow-blue-900/5">
          <div className="px-4">
             <div className="flex items-center gap-3 mb-1">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                    <Award size={28} />
                </div>
                <h1 className="text-3xl font-black text-gray-900">My Certificates</h1>
             </div>
             <p className="text-gray-500 font-medium ml-1">Archive of your volunteering achievements</p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white text-gray-600 rounded-2xl border border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 focus:outline-none shadow-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-32 bg-white/50 rounded-[3rem] border-2 border-dashed border-gray-200 backdrop-blur-sm">
             <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Award className="w-12 h-12 text-gray-400" />
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">No Certificates Yet</h3>
             <p className="text-gray-500 text-lg max-w-md mx-auto">
               {searchTerm ? 'No matching certificates found.' : 'Complete events and submit feedback to earn certificates!'}
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCertificates.map((cert) => {
              const isLocked = !cert.feedbacks || cert.feedbacks.length === 0;

              return (
                <div 
                  key={cert.id} 
                  className={`group bg-white rounded-[2rem] p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 relative overflow-hidden ${
                    isLocked ? 'border border-gray-200 opacity-90' : 'border border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  {/* Gradient Top Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-2 ${isLocked ? 'bg-gray-200' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} />

                  {/* Header Part */}
                  <div className="flex items-start justify-between mb-6 mt-2">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform  ${
                        isLocked ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                     }`}>
                        <Award size={28} />
                     </div>
                     {!isLocked && (
                       <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                         {cert.certificateUrl ? 'Official' : 'Verified'}
                       </span>
                     )}
                  </div>

                  {/* Details */}
                  <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-1 group-hover:text-emerald-600 transition-colors" title={cert.title}>
                    {cert.title}
                  </h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-xl">
                      <Calendar size={16} className="text-emerald-500" />
                      {new Date(cert.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-xl">
                      <MapPin size={16} className="text-emerald-500" />
                      {cert.locationName || "On Site"}
                    </div>
                  </div>

                  {/* Actions - Dual Buttons */}
                  <div className="flex gap-3">
                    {isLocked ? (
                         <button
                           onClick={() => openPreview(cert)}
                           className="w-full py-4 rounded-xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
                         >
                            Locked (Submit Feedback)
                         </button>
                    ) : (
                        <>
                            <button
                                onClick={() => openPreview(cert)}
                                className="flex-1 py-3 rounded-xl font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                                title="View Certificate"
                            >
                                <Eye size={18} /> Preview
                            </button>
                            <button
                                onClick={() => handleDownload(cert)}
                                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2"
                                title="Download Certificate"
                            >
                                {cert.certificateUrl ? <ExternalLink size={18} /> : <Download size={18} />}
                                Download
                            </button>
                        </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        <CertificateModal 
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          volunteerName={user?.name}
          event={currentCert}
        />
      </div>
    </div>
  );
}
