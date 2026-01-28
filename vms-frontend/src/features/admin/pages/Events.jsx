// src/features/admin/pages/Events.jsx
import React, { useState, useEffect } from 'react';
import { useApi } from '../../../useApi';
import { Search, Edit, Trash2, Eye, Plus, CheckCircle, XCircle, Calendar, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await apiCall('/admin/events');
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Events fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm(`Delete "${events.find(e => e.id === eventId)?.title}"?`)) return;
    
    try {
      setDeletingId(eventId);
      await apiCall(`/admin/events/${eventId}`, { method: 'DELETE' });
      setEvents(events.filter(event => event.id !== eventId));
      alert('✅ Event deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Delete failed: ' + (error.message || 'Server error'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await apiCall(`/admin/events/${eventId}/approve`, { method: 'PATCH' });
      setEvents(events.map(e => e.id === eventId ? { ...e, status: 'PUBLISHED' } : e));
      alert('✅ Event Approved!');
    } catch (error) {
      console.error('Approve error:', error);
      alert('❌ Error approving event: ' + (error.message || 'Server error'));
    }
  };

  const handleReject = async (eventId) => {
    if (!confirm('Are you sure you want to reject this event?')) return;
    try {
      await apiCall(`/admin/events/${eventId}/reject`, { method: 'PATCH' });
      setEvents(events.map(e => e.id === eventId ? { ...e, status: 'REJECTED' } : e));
      alert('❌ Event Rejected');
    } catch (error) {
      console.error('Reject error:', error);
      alert('❌ Error rejecting event: ' + (error.message || 'Server error'));
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Manage Events</h1>
            <p className="text-lg text-gray-500 font-medium">Admin Control Center • {events.length} Total Events</p>
          </div>
          
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search events, organizers, or categories..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Link 
              to="/admin/events/create"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center gap-2 shrink-0"
            >
              <Plus size={20} />
              New Event
            </Link>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading events...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Organizer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/admin/events/${event.id}`)}>
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500">{event.category}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {event.organizer?.name || 'Unknown'} 
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN') : 'TBD'}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {event.locationName || event.city || 'N/A'}
                    </td>

                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                         event.status === 'PUBLISHED' || event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                         event.status === 'PENDING_APPROVAL' || event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                         event.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                         'bg-gray-100 text-gray-700'
                       }`}>
                         {event.status}
                       </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {(event.status === 'PENDING_APPROVAL' || event.status === 'PENDING') && (
                          <>
                            <button 
                              onClick={() => handleApprove(event.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <CheckCircle size={16} /> Approve
                            </button>
                            <button 
                              onClick={() => handleReject(event.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <XCircle size={16} /> Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => navigate(`/admin/events/${event.id}`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <Link to={`/admin/events/${event.id}/edit`} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          disabled={deletingId === event.id}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Delete"
                        >
                          {deletingId === event.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 font-medium">No events found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
