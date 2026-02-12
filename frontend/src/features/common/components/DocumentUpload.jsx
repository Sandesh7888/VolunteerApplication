import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useApi } from '../../../useApi';
import { 
  FileText, Upload, CheckCircle2, XCircle, Clock, 
  Trash2, Eye, Download, AlertCircle, Loader2, FileCheck,
  ShieldCheck, ArrowUpRight, Info
} from 'lucide-react';

export default function DocumentUpload({ targetUserId, isAdminView, onVerificationChange }) {
  const { user: authUser } = useAuth();
  const { apiCall } = useApi();
  const effectiveUserId = targetUserId || authUser?.userId;
  const [documents, setDocuments] = useState([]);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const documentTypes = [
    { value: 'GOV_ID', label: 'Government ID', description: 'Driving License / Passport' },
    { value: 'ADDRESS_PROOF', label: 'Address Proof', description: 'Utility Bill / Bank Letter' },
    { value: 'EDUCATIONAL_CERT', label: 'Educational Cert', description: 'Degree Certificate' },
    { value: 'BACKGROUND_CHECK', label: 'Background Check', description: 'Police Clearance' },
    { value: 'PROFESSIONAL_CERT', label: 'Professional Cert', description: 'Skills Certification' },
    { value: 'OTHER', label: 'Other', description: 'Supporting Docs' }
  ];

  useEffect(() => {
    if (authUser?.userId) {
      fetchDocuments();
    }
  }, [authUser]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/documents/user/${effectiveUserId}`);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Files must be under 10MB' });
      return;
    }

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Only PDF format is allowed' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', authUser.userId);
      formData.append('documentType', documentType);

      const response = await apiCall('/documents/upload', {
        method: 'POST',
        body: formData
      });

      setMessage({ type: 'success', text: 'Secure upload completed!' });
      fetchDocuments();
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failure. Please try again.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const getDocUrl = (fileName) => {
    return `http://localhost:8080/api/documents/download/${fileName}`;
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Permanent deletion. Proceed?')) return;

    try {
      await apiCall(`/documents/${documentId}?userId=${authUser.userId}`, {
        method: 'DELETE'
      });
      setMessage({ type: 'success', text: 'Securely deleted.' });
      fetchDocuments();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Deletion blocked.' });
    }
  };

  const handleVerify = async (documentId, status, rejectionReason = null) => {
    try {
      setUploading(true);
      const isApproved = status === 'VERIFIED';
      
      // Correct endpoint: PUT /api/documents/{documentId}/verify?adminId={adminId}&approved={approved}&notes={notes}
      let endpoint = `/documents/${documentId}/verify?adminId=${authUser.userId}&approved=${isApproved}`;
      if (rejectionReason) {
        endpoint += `&notes=${encodeURIComponent(rejectionReason)}`;
      }

      await apiCall(endpoint, {
        method: 'PUT'
      });
      
      setMessage({ type: 'success', text: `Document ${status.toLowerCase()} successfully!` });
      fetchDocuments();
      if (onVerificationChange) onVerificationChange();
    } catch (err) {
      console.error('Failed to verify document:', err);
      setMessage({ type: 'error', text: 'Error performing verification.' });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 ring-2 ring-emerald-50">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </div>
        );
      case 'REJECTED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 ring-2 ring-rose-50">
            <XCircle className="w-3 h-3" /> Rejected
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-200 ring-2 ring-amber-50">
            <Clock className="w-3 h-3" /> Pending
          </div>
        );
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-900/5 border border-indigo-50/50 relative overflow-hidden group/doc">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-50"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-50">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
          <span className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
            <ShieldCheck className="w-6 h-6" />
          </span>
          Security Verification
        </h2>
        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
          <Info className="w-3.5 h-3.5" />
          Only PDF format accepted
        </div>
      </div>

      {message.text && (
        <div className={`mb-8 p-5 rounded-3xl flex items-center gap-4 font-black text-sm animate-in zoom-in-95 duration-300 shadow-xl ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
        }`}>
          <div className={`p-2 rounded-xl text-white ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          {message.text}
        </div>
      )}

      {/* Grid Layout for Docs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {documentTypes.filter(type => 
          type.value === 'GOV_ID' || 
          type.value === 'ADDRESS_PROOF' || 
          showAllTypes || 
          documents.some(d => d.documentType === type.value)
        ).map((docType) => {
          const existingDoc = documents.find(d => d.documentType === docType.value);
          const isRequired = docType.value === 'GOV_ID' || docType.value === 'ADDRESS_PROOF';
          
          return (
            <div key={docType.value} className={`relative p-6 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden group/item ${
              existingDoc?.verificationStatus === 'VERIFIED' 
                ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100 hover:shadow-emerald-100 shadow-xl' 
                : isRequired 
                  ? 'bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100/50 hover:shadow-indigo-100 shadow-lg' 
                  : 'bg-white border-gray-100 hover:shadow-gray-100 shadow-md'
            }`}>
              {isRequired && !existingDoc && (
                <div className="absolute top-0 right-0 p-3 bg-amber-400 text-white text-[8px] font-black rounded-bl-2xl uppercase tracking-widest shadow-sm">Required</div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50 group-hover/item:scale-110 transition-transform duration-300">
                    <FileText className={`w-5 h-5 ${existingDoc ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  {existingDoc && getStatusBadge(existingDoc.verificationStatus)}
                </div>

                <div>
                  <h3 className="font-black text-gray-900 text-sm tracking-tight">{docType.label}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{docType.description}</p>
                </div>

                {existingDoc ? (
                  <div className="pt-2 space-y-3">
                    <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between group/file">
                      <span className="text-[10px] font-bold text-gray-500 truncate mr-2">{existingDoc.fileName}</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-300 group-hover/file:text-indigo-500 transition-colors" />
                    </div>
                    {existingDoc.rejectionReason && (
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-2">
                         <XCircle className="w-3 h-3 text-rose-500 mt-0.5" />
                         <p className="text-[9px] font-bold text-rose-600 leading-tight">Rejected: {existingDoc.rejectionReason}</p>
                      </div>
                    )}
                    
                    {/* Always show preview button */}
                    <button
                      onClick={() => window.open(getDocUrl(existingDoc.documentUrl), '_blank')}
                      className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Document
                    </button>
                    
                    {/* Show upload/delete only if NOT verified */}
                    {existingDoc.verificationStatus !== 'VERIFIED' && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <button
                        onClick={() => document.getElementById(`file-${docType.value}`).click()}
                        className="w-full py-2.5 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Upload className="w-3.5 h-3.5" /> Replace
                      </button>
                      <button
                        onClick={() => handleDelete(existingDoc.id)}
                        className="w-full py-2.5 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                    )}
                    
                    {isAdminView && existingDoc.verificationStatus === 'PENDING' && (
                      <div className="pt-4 grid grid-cols-2 gap-3 border-t border-gray-100 mt-4">
                        <button
                          onClick={() => handleVerify(existingDoc.id, 'VERIFIED')}
                          className="py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) handleVerify(existingDoc.id, 'REJECTED', reason);
                          }}
                          className="py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="block mt-4 group/btn">
                    <div className="w-full py-4 bg-gray-50 group-hover/btn:bg-indigo-600 border-2 border-dashed border-gray-200 group-hover/btn:border-transparent rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer">
                      <Upload className="w-4 h-4 text-gray-400 group-hover/btn:text-white transition-colors" />
                      <span className="text-[10px] font-black text-gray-400 group-hover/btn:text-white uppercase tracking-widest">Select PDF</span>
                    </div>
                    <input
                      id={`file-${docType.value}`}
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, docType.value)}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
        
        {!showAllTypes && (
          <button 
            onClick={() => setShowAllTypes(true)}
            className="p-6 rounded-[2rem] border-2 border-dashed border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-3 transition-all group/add"
          >
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50 group-hover/add:scale-110 transition-transform">
              <FileCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Add Certificate</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">Enterprise Standard Security</p>
          <p className="text-[10px] font-bold text-indigo-400 leading-relaxed max-w-lg">All documents are encrypted at rest and only accessible by authorized verification officers. Verification typically takes 24-48 hours.</p>
        </div>
      </div>
    </div>
  );
}
