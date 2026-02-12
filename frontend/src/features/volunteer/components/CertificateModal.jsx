import React, { useRef } from 'react';
import { X, Award, MapPin, Calendar, Clock, Download, Share2, ShieldCheck, Printer, ExternalLink } from 'lucide-react';

export default function CertificateModal({ isOpen, onClose, volunteerName, event }) {
  const certificateRef = useRef(null);

  if (!isOpen || !event) return null;

  const handlePrint = () => {
    // Trigger browser print dialog
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadOfficial = async () => {
    if (event.certificateUrl) {
        if (event.certificateUrl.startsWith('certificates/')) {
            try {
                const fileName = event.certificateUrl.split('/').pop();
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
            window.open(event.certificateUrl, '_blank');
        }
    }
  };

  // Calculate hours (assuming event duration)
  const calculateHours = () => {
    if (!event.startTime || !event.endTime) return 'N/A';
    const start = new Date(`2000-01-01T${event.startTime}`);
    const end = new Date(`2000-01-01T${event.endTime}`);
    const hours = Math.abs(end - start) / 36e5;
    return hours.toFixed(1);
  };

  const eventDate = new Date(event.startDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md overflow-hidden print:p-0 print:bg-white print:block">
      
      {/* Modal Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20 print:hidden">
        {event.certificateUrl && (
            <button 
              onClick={handleDownloadOfficial}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-2"
              title="Open Official PDF"
            >
              <ExternalLink size={16} /> <span className="hidden sm:inline">Official</span>
            </button>
        )}
        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Printer size={16} /> <span className="hidden sm:inline">Print</span>
        </button>
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Container - Responsive Scaling */}
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
        <div 
            ref={certificateRef}
            className="certificate-content relative p-8 lg:p-12 bg-white border-[12px] border-double border-slate-100 m-3 rounded-[1.5rem] flex flex-col items-center justify-center text-center overflow-hidden print:border-none print:m-0 print:p-8"
            style={{
                aspectRatio: '1.414 / 1',
                width: 'min(95vw, 750px)', // Further reduced to 750px for better 100% zoom fit
                maxHeight: '80vh', // Reduced height constraint
            }}
        >
          
          {/* Decorative Corner Ornaments - Restored */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-emerald-600/30 rounded-tl-3xl m-4 -z-0"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-emerald-600/30 rounded-tr-3xl m-4 -z-0"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-emerald-600/30 rounded-bl-3xl m-4 -z-0"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-emerald-600/30 rounded-br-3xl m-4 -z-0"></div>

          {/* Background Watermark - Restored */}
          <Award className="absolute text-emerald-500/5 -z-0 w-96 h-96 pointer-events-none" />

          {/* Header - Restored */}
          <div className="relative z-10 space-y-3 mb-3 lg:mb-8 flex-1 flex flex-col justify-end">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100 hidden sm:flex">
               <Award className="text-emerald-600 w-10 h-10" />
            </div>
            <h1 className="text-xs sm:text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mb-2">Volunteer Hub Official</h1>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">Certificate of Excellence</h2>
            <div className="h-1 w-28 bg-emerald-500 mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Body - Restored */}
          <div className="relative z-10 space-y-3 sm:space-y-5 max-w-2xl flex-1 flex flex-col justify-center">
            <p className="text-base sm:text-lg text-slate-500 font-medium italic">This is to certify that</p>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 underline decoration-emerald-500 decoration-4 underline-offset-6">
              {volunteerName}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium mt-3">
              has successfully completed volunteer service for the event
            </p>
            <div className="bg-slate-50 p-3 sm:p-5 rounded-3xl border border-slate-100 my-2 sm:my-4">
               <h4 className="text-lg sm:text-xl font-black text-slate-900 mb-2 truncate max-w-md mx-auto">{event.title}</h4>
               <div className="flex flex-wrap justify-center gap-3 sm:gap-5 text-slate-500 font-bold text-xs uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-500" />
                    {eventDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-500" />
                    {event.locationName}
                  </div>
               </div>
               {event.organizer && (
                 <p className="text-xs text-slate-600 mt-2 font-semibold">
                   Organized by: {event.organizer.name}
                 </p>
               )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <p className="text-emerald-600 font-black text-[10px] uppercase tracking-wider">Certificate ID</p>
                <p className="text-slate-900 font-bold mt-1 text-xs">VH-{event.id}-{event.registrationId || 'CERT'}</p>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                <p className="text-blue-600 font-black text-[10px] uppercase tracking-wider">Volunteer Hours</p>
                <p className="text-slate-900 font-bold mt-1 text-xs">{calculateHours()} Hours</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              This certificate recognizes outstanding dedication and valuable contribution to our community.
            </p>
          </div>

          {/* Footer / Signatures - Restored */}
          <div className="relative z-10 mt-6 lg:mt-10 w-full flex flex-row items-end justify-between gap-3 sm:gap-8 px-2 sm:px-8 flex-1">
            <div className="text-center">
               <div className="w-20 sm:w-40 border-b-2 border-slate-200 mb-1"></div>
               <p className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Date of Issue</p>
               <p className="font-bold text-slate-900 text-xs">{new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="flex items-center justify-center -mt-6 hidden sm:flex">
               <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-600/10 rounded-full animate-pulse"></div>
                  <ShieldCheck className="text-emerald-600 w-12 h-12 relative z-10" />
               </div>
            </div>

            <div className="text-center">
               <div className="w-20 sm:w-40 border-b-2 border-slate-200 mb-1"></div>
               <p className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Official Seal</p>
               <p className="font-bold text-slate-900 text-xs">Volunteer Hub Team</p>
            </div>
          </div>

        </div>
      </div>
      
      <style jsx="true">{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0, .fixed.inset-0 * {
            visibility: visible;
          }
          .fixed.inset-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
            background: white !important;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate-content {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            transform: none !important;
          }
          .print\\:hidden { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </div>
  );
}
