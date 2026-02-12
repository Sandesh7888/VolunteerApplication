import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  FileCheck, Shield, Clock, CheckCircle2, XCircle, 
  Eye, Download, Loader2, AlertCircle, Search,
  Filter, User, Calendar, ExternalLink, X, FileText,
  Award
} from 'lucide-react';

export default function AdminDocumentVerification() {
  const { apiCall } = useApi();
  const { user: adminUser } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING, VERIFIED, REJECTED
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedDocForAction, setSelectedDocForAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Fetch based on current filter/tab
      const data = await apiCall(`/documents?status=${filter}`);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (docId, approved, notes = '') => {
    try {
      setActionLoading(docId);
      await apiCall(`/documents/${docId}/verify?adminId=${adminUser.userId}&approved=${approved}&notes=${notes}`, {
        method: 'PUT'
      });
      
      // Remove the processed document from the current filtered list
      // because tabs are exclusive (Pending vs Verified vs Rejected)
      setDocuments(prev => prev.filter(d => d.id !== docId));
      
      // Update modal state if open
      if (selectedUser) {
          setSelectedUser(prev => ({
              ...prev,
              docs: prev.docs.map(d => d.id === docId ? { 
                  ...d, 
                  verificationStatus: approved ? 'VERIFIED' : 'REJECTED', 
                  verifiedAt: new Date().toISOString() 
              } : d)
          }));
      }

      setShowRejectionModal(false);
      setSelectedDocForAction(null);
      setRejectionNotes('');
    } catch (err) {
      console.error('failed to verify:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getDocUrl = (fileName) => {
    return `http://localhost:8080/api/documents/download/${fileName}`;
  };

  // Group documents by user
  const groupedDocuments = documents.reduce((acc, doc) => {
      if (!acc[doc.user.id]) {
          acc[doc.user.id] = { user: doc.user, docs: [] };
      }
      acc[doc.user.id].docs.push(doc);
      return acc;
  }, {});

  const tabs = [
    { id: 'PENDING', label: 'Pending Users', color: 'indigo' },
    { id: 'VERIFIED', label: 'Approved Users', color: 'emerald' },
    { id: 'REJECTED', label: 'Rejected Users', color: 'rose' }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-white/40 p-6 rounded-[2.5rem] border border-white/60 backdrop-blur-sm shadow-xl shadow-blue-900/5">
          <div className="px-4">
             <div className="flex items-center gap-3 mb-1">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                    <Award size={28} />
                </div>
                <h1 className="text-3xl font-black text-gray-900">Doc verification</h1>
             </div>
             <p className="text-gray-500 font-medium ml-1">verify the documents of users</p>
          </div>
          
        </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white rounded-[2rem] p-6 shadow-xl shadow-indigo-900/5 border border-indigo-50/50">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-2xl border border-gray-100/50">
          {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${filter === tab.id ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-200` : `text-gray-400 hover:text-${tab.color}-600 hover:bg-${tab.color}-50`}`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin w-16 h-16 text-indigo-600 mb-6" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Accessing Encrypted Storage...</p>
        </div>
      ) : Object.keys(groupedDocuments).length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
           <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-gray-200" />
           </div>
           <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">No {filter.toLowerCase()} users found</h3>
           <p className="text-gray-400 font-medium">There are no {filter.toLowerCase()} documents to display.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Object.values(groupedDocuments)
            .filter(group => group.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(({ user, docs }) => (
            <div 
                key={user.id} 
                onClick={() => setSelectedUser({ ...user, docs })}
                className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5 border border-indigo-50/50 hover:border-indigo-200 transition-all duration-500 group cursor-pointer active:scale-95"
            >
              <div className="flex items-start justify-between mb-6">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                       <User className="w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900 tracking-tight">{user.name}</h3>
                       <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest mt-1 inline-block">
                          {user.role}
                       </span>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-indigo-600">{docs.length}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pending Files</span>
                 </div>
              </div>

              <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-500 uppercase">Documents</span>
                     <div className="flex -space-x-2">
                        {docs.slice(0, 3).map((doc, i) => (
                            <div key={doc.id} className="w-8 h-8 rounded-full bg-white border-2 border-gray-50 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm" style={{ zIndex: 3-i }}>
                                <FileText className="w-4 h-4" />
                            </div>
                        ))}
                        {docs.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">
                                +{docs.length - 3}
                            </div>
                        )}
                     </div>
                  </div>
                  <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] group-hover:bg-indigo-600 transition-colors shadow-lg shadow-gray-200 group-hover:shadow-indigo-200">
                      Process Verification
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Verification Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10 animate-in zoom-in-95 duration-300">
           <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={() => { setSelectedUser(null); setPreviewDoc(null); }}></div>
           <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
                       <User className="w-8 h-8" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedUser.name}</h2>
                       <div className="flex flex-wrap items-center gap-3 mt-1">
                           <InfoBadge label="Role" value={selectedUser.role} />
                           <InfoBadge label="ID" value={selectedUser.vmsId || `#${selectedUser.id}`} />
                           <InfoBadge label="Status" value={selectedUser.verified ? 'Verified' : 'Unverified'} color={selectedUser.verified ? 'emerald' : 'amber'} />
                       </div>
                    </div>
                 </div>
                 <button onClick={() => { setSelectedUser(null); setPreviewDoc(null); }} className="p-3 bg-white text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-gray-100">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Modal Body: Side-by-Side */}
              <div className="flex-1 flex overflow-hidden bg-gray-50/30">
                 
                 {/* Left Column: Document List */}
                 <div className="w-full md:w-[350px] border-r border-gray-100 overflow-y-auto p-6 space-y-6 bg-white">
                    <div className="flex items-center justify-between">
                       <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                          Documents <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg text-xs">{selectedUser.docs?.length || 0}</span>
                       </h3>
                    </div>
                    
                    <div className="space-y-4">
                       {selectedUser.docs?.map(doc => (
                           <div 
                               key={doc.id} 
                               onClick={() => setPreviewDoc(doc)}
                               className={`p-4 rounded-2xl border transition-all cursor-pointer ${previewDoc?.id === doc.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-gray-50 border-gray-100 hover:border-indigo-100'}`}
                           >
                               <div className="flex items-start gap-3">
                                   <div className={`p-2 rounded-lg ${previewDoc?.id === doc.id ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-400'}`}>
                                       <FileText className="w-5 h-5" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                       <h4 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">
                                          {doc.documentType?.replace('_', ' ')}
                                       </h4>
                                       <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">{doc.fileName}</p>
                                       
                                       <div className="flex items-center gap-2 mt-2">
                                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                                             doc.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' : 
                                             doc.verificationStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 
                                             'bg-amber-50 text-amber-600'
                                          }`}>
                                             {doc.verificationStatus}
                                          </span>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       ))}
                    </div>
                 </div>

                 {/* Right Column: Integrated Preview */}
                 <div className="flex-1 flex flex-col min-w-0">
                    {previewDoc ? (
                       <>
                          <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                   <Eye className="w-4 h-4" />
                                </div>
                                <h4 className="font-bold text-gray-900 uppercase text-xs tracking-widest">
                                   {previewDoc.documentType?.replace('_', ' ')} Preview
                                </h4>
                             </div>
                             <div className="flex items-center gap-2">
                                <a 
                                  href={getDocUrl(previewDoc.documentUrl)} 
                                  download={previewDoc.fileName}
                                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all border border-emerald-100 font-bold text-[10px] uppercase tracking-widest"
                                  title="Download Document"
                                >
                                   <Download className="w-4 h-4" /> Download
                                </a>
                                <a 
                                  href={getDocUrl(previewDoc.documentUrl)} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors border border-gray-100"
                                  title="Open in new tab"
                                >
                                   <ExternalLink className="w-4 h-4" />
                                </a>
                             </div>
                          </div>
                          
                          <div className="flex-1 bg-gray-200 relative">
                             <iframe 
                                src={`${getDocUrl(previewDoc.documentUrl)}#toolbar=0`} 
                                className="w-full h-full border-none"
                                title="Document Preview"
                             ></iframe>
                          </div>

                          <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-center gap-4">
                             {previewDoc.verificationStatus === 'PENDING' ? (
                                <>
                                   <button 
                                      onClick={() => handleVerify(previewDoc.id, true)}
                                      disabled={actionLoading === previewDoc.id}
                                      className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-200"
                                   >
                                      {actionLoading === previewDoc.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                      Approve
                                   </button>
                                   <button 
                                      onClick={() => {
                                         setSelectedDocForAction(previewDoc);
                                         setShowRejectionModal(true);
                                      }}
                                      className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-rose-200"
                                   >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                   </button>
                                </>
                             ) : (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${previewDoc.verificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                   {previewDoc.verificationStatus === 'VERIFIED' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                   Document {previewDoc.verificationStatus}
                                </div>
                             )}
                          </div>
                       </>
                    ) : (
                       <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 mb-6">
                             <Eye className="w-10 h-10 text-indigo-200" />
                          </div>
                          <h4 className="text-xl font-black text-gray-900 mb-2">Select a document</h4>
                          <p className="text-gray-400 text-sm font-medium max-w-xs">Click on any document from the list on the left to preview it and take action.</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}



      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-[130] flex items-start justify-center p-6 pt-20 animate-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" onClick={() => setShowRejectionModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-3xl">
             <div className="text-center space-y-4 mb-8">
               <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-rose-50">
                 <XCircle className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">Rejection Reason</h3>
               <p className="text-gray-400 font-medium text-sm">Please provide a constructive reason why this document was rejected.</p>
             </div>

             <textarea 
               className="w-full p-6 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-rose-500/10 font-bold min-h-[150px] mb-8"
               placeholder="Example: The document is blurry or the ID has expired."
               value={rejectionNotes}
               onChange={(e) => setRejectionNotes(e.target.value)}
             ></textarea>

             <div className="flex gap-4">
               <button 
                 onClick={() => handleVerify(selectedDocForAction.id, false, rejectionNotes)}
                 disabled={!rejectionNotes.trim()}
                 className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-50"
               >
                 Confirm Rejection
               </button>
               <button 
                 onClick={() => setShowRejectionModal(false)}
                 className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
               >
                 Cancel
               </button>
             </div>
          </div>
        </div>
      )}


    </div>
  );
}

const InfoBadge = ({ label, value, color = 'gray' }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 bg-${color}-50 rounded-lg border border-${color}-100`}>
        <span className={`text-[10px] font-black uppercase tracking-wide text-${color}-400`}>{label}:</span>
        <span className={`text-xs font-bold text-${color}-700`}>{value}</span>
    </div>
);
