import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useApi } from '../../../useApi';
import { Search, AlertCircle, CheckCircle, Clock, LifeBuoy, Edit2, Trash2, X, BarChart3 } from 'lucide-react';

export default function AdminSupportTickets() {
  const { user } = useAuth();
  const { apiCall } = useApi();
  
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ new: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  const [updateData, setUpdateData] = useState({
    status: '',
    adminNotes: ''
  });

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/support/tickets');
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiCall('/support/tickets/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`/support/tickets/${selectedTicket.id}/status?adminId=${user?.userId}&status=${updateData.status}&adminNotes=${encodeURIComponent(updateData.adminNotes)}`, {
        method: 'PATCH'
      });
      setShowUpdateModal(false);
      setSelectedTicket(null);
      setUpdateData({ status: '', adminNotes: '' });
      fetchTickets();
      fetchStats();
    } catch (error) {
      alert('Failed to update ticket: ' + error.message);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await apiCall(`/support/tickets/${ticketId}?adminId=${user?.userId}`, {
        method: 'DELETE'
      });
      fetchTickets();
      fetchStats();
    } catch (error) {
      alert('Failed to delete ticket: ' + error.message);
    }
  };

  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateData({ status: ticket.status, adminNotes: '' });
    setShowUpdateModal(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const styles = {
      NEW: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      FIXED: 'bg-green-100 text-green-800 border-green-200'
    };
    const icons = { NEW: AlertCircle, IN_PROGRESS: Clock, RESOLVED: CheckCircle, FIXED: CheckCircle };
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
    return <span className={`px-2 py-1 rounded-lg text-xs font-bold ${styles[priority]}`}>{priority}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-8 mb-8 border border-white/60 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <LifeBuoy className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Support Ticket Management</h1>
              <p className="text-slate-600 font-medium">Manage and resolve user support requests</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 font-black text-sm uppercase tracking-wider">New Tickets</p>
                  <p className="text-3xl font-black text-blue-900 mt-1">{stats.new || 0}</p>
                </div>
                <AlertCircle className="text-blue-500" size={40} />
              </div>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 font-black text-sm uppercase tracking-wider">In Progress</p>
                  <p className="text-3xl font-black text-yellow-900 mt-1">{stats.inProgress || 0}</p>
                </div>
                <Clock className="text-yellow-500" size={40} />
              </div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 font-black text-sm uppercase tracking-wider">Resolved</p>
                  <p className="text-3xl font-black text-green-900 mt-1">{stats.resolved || 0}</p>
                </div>
                <CheckCircle className="text-green-500" size={40} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-6 mb-6 border border-white/60 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search tickets or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-medium"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-bold bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-6 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-bold bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="TECHNICAL">Technical</option>
              <option value="ACCOUNT">Account</option>
              <option value="EVENT">Event</option>
              <option value="CERTIFICATE">Certificate</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-12 text-center border border-white/60">
            <LifeBuoy className="mx-auto text-slate-300" size={64} />
            <p className="mt-4 text-slate-600 font-bold text-lg">No tickets found</p>
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
                    <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                      <span className="font-bold">User: {ticket.user?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span className="font-bold">Role: {ticket.user?.role || 'N/A'}</span>
                      <span>•</span>
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
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openUpdateModal(ticket)}
                      className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl transition-all"
                      title="Update Status"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all"
                      title="Delete Ticket"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {ticket.adminNotes && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2">Admin Notes</p>
                    <p className="text-slate-700 font-medium whitespace-pre-wrap">{ticket.adminNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">Update Ticket Status</h2>
                <button onClick={() => setShowUpdateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <h3 className="font-black text-slate-900 mb-2">{selectedTicket.subject}</h3>
                <p className="text-slate-600 text-sm">{selectedTicket.description}</p>
              </div>

              <form onSubmit={handleUpdateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">Status *</label>
                  <select
                    required
                    value={updateData.status}
                    onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-bold"
                  >
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">Admin Notes</label>
                  <textarea
                    value={updateData.adminNotes}
                    onChange={(e) => setUpdateData({...updateData, adminNotes: e.target.value})}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-medium resize-none"
                    placeholder="Add notes about the resolution or next steps..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Update Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
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
