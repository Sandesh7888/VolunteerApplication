import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useApi } from '../../../useApi';
import { Plus, Search, AlertCircle, CheckCircle, Clock, LifeBuoy, X } from 'lucide-react';

export default function VolunteerSupport() {
  const { user } = useAuth();
  const { apiCall } = useApi();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/support/tickets/user/${user?.userId}`);
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`/support/tickets?userId=${user?.userId}&subject=${encodeURIComponent(formData.subject)}&description=${encodeURIComponent(formData.description)}&category=${formData.category}&priority=${formData.priority}`, {
        method: 'POST'
      });
      setShowCreateModal(false);
      setFormData({ subject: '', description: '', category: 'TECHNICAL', priority: 'MEDIUM' });
      fetchTickets();
    } catch (error) {
      alert('Failed to create ticket: ' + error.message);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      NEW: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      FIXED: 'bg-green-100 text-green-800 border-green-200'
    };
    const icons = {
      NEW: AlertCircle,
      IN_PROGRESS: Clock,
      RESOLVED: CheckCircle,
      FIXED: CheckCircle
    };
    const Icon = icons[status];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        <Icon size={14} />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      LOW: 'bg-gray-100 text-gray-700',
      MEDIUM: 'bg-orange-100 text-orange-700',
      HIGH: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-6 mb-8 border border-white/60 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <LifeBuoy className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900">Help & Support</h1>
                <p className="text-slate-600 font-medium">Submit and track your support tickets</p>
              </div>
            </div>
            
            {/* Right side: New Ticket + Search + Filter */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="flex-1 lg:w-64 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-medium text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-bold bg-white text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap"
              >
                <Plus size={18} />
                New Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-12 text-center border border-white/60">
            <LifeBuoy className="mx-auto text-slate-300" size={64} />
            <p className="mt-4 text-slate-600 font-bold text-lg">No tickets found</p>
            <p className="text-slate-500">Create a new ticket to get help from our team</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-slate-900">{ticket.subject}</h3>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <p className="text-slate-600 font-medium mb-3">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="font-bold">Category: {ticket.category}</span>
                      <span>•</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.resolvedAt && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-bold">Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {ticket.adminNotes && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2">Admin Response</p>
                    <p className="text-slate-700 font-medium whitespace-pre-wrap">{ticket.adminNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Create Support Ticket</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-medium"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-medium resize-none"
                    placeholder="Provide detailed information about your issue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-bold"
                    >
                      <option value="TECHNICAL">Technical Issue</option>
                      <option value="ACCOUNT">Account Problem</option>
                      <option value="EVENT">Event Related</option>
                      <option value="CERTIFICATE">Certificate Issue</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2">Priority *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-bold"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Submit Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
