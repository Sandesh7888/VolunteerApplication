// src/features/admin/pages/Events.jsx
import React, { useState, useEffect } from 'react';
import { useApi } from '../../../useApi';
import { Search, Filter, Edit, Trash2, Eye, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await apiCall('/events'); // ✅ Admin sees ALL events
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Events fetch error:', error);
    } finally {
      setLoading(false);
    }
  };
// Events.jsx - CHANGE THIS LINE ONLY
const handleDelete = async (eventId) => {
  if (!confirm(`Delete "${events.find(e => e.id === eventId)?.title}"?`)) return;
  
  try {
    setDeletingId(eventId);
    // ✅ CHANGED: /admin/{id} instead of /{id}
    await apiCall(`/admin/events/${eventId}`, { 
      method: 'DELETE' 
    });
    setEvents(events.filter(event => event.id !== eventId));
    alert('✅ Event deleted successfully!');
  } catch (error) {
    console.error('Delete error:', error);
    alert('❌ Delete failed: ' + (error.message || 'Server error'));
  } finally {
    setDeletingId(null);
  }
};


  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      await apiCall(`/events/${eventId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setEvents(events.map(event => 
        event.id === eventId ? { ...event, status: newStatus } : event
      ));
      alert('Status updated!');
    } catch (error) {
      alert('Update failed: ' + error.message);
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || event.status === statusFilter)
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Events</h1>
            <p className="text-xl text-gray-600">Admin view - All events ({events.length})</p>
          </div>
          <Link 
            to="/admin/events/create"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
          >
            <Plus size={24} />
            New Event
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white  rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="text-black relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-6 py-3 border text-black border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="PUBLISHED"  className='bg-green-400' >Published</option>
            <option value="PENDING" className='bg-yellow-400' >Pending</option>
            <option value="APPROVED"className='bg-blue'>Approved</option>
            <option value="COMPLETED" className='bg-white'>Completed</option>
            <option value="REJECTED"className='bg-red' >Rejected</option>
          </select>
        </div>
      </div>

      {/* Events Table - FULL CRUD */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Volunteers</th>
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
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN') : 'TBD'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">{event.locationName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {event.currentVolunteers}/{event.requiredVolunteers}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={event.status} 
                        onChange={(e) => handleStatusUpdate(event.id, e.target.value)}
                        className="px-3 py-1 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white"
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => navigate(`/admin/events/${event.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg hover:shadow-md transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <Link to={`/admin/events/${event.id}/edit`} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg hover:shadow-md transition-all">
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          disabled={deletingId === event.id}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg hover:shadow-md transition-all disabled:opacity-50"
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
            <p className="text-xl text-gray-500">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
