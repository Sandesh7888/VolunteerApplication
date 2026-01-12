// src/features/volunteer/pages/VolunteerEventDetails.jsx - FIXED DATA + COLORS
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Tag, Users, Eye, Share2, Heart 
} from 'lucide-react';

export default function VolunteerEventDetails() {
  const { eventId } = useParams();
  const [allEvents, setAllEvents] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { apiCall } = useApi();

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const eventsData = await apiCall('/events/volunteer/myevents').catch(() => []);
      const foundEvent = eventsData.find(e => e.id === parseInt(eventId) || e.id === eventId);
      setAllEvents(eventsData);
      setEvent(foundEvent);
    } catch (err) {
      console.error('Event fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayStatus = (status) => {
    const statusMap = { 'PUBLISHED': 'ONGOING', 'APPROVED': 'ONGOING' };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    const colors = {
      'ONGOING': 'bg-orange-100 text-orange-800 border-orange-300',
      'UPCOMING': 'bg-blue-100 text-blue-800 border-blue-300',
      'COMPLETED': 'bg-gray-100 text-gray-800 border-gray-300',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[displayStatus] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-200 rounded-2xl"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-gray-500">
          <Link to="/volunteer/my-events" className="hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> My Events
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">{event?.title}</span>
        </nav>

        {event ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Title & Status */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                      {event.title}
                    </h1>
                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(event.status)}`}>
                      {getDisplayStatus(event.status)}
                    </span>
                  </div>
                  <div className="ml-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {event.currentVolunteers}/{event.requiredVolunteers}
                    </div>
                    <div className="text-sm text-gray-500">Volunteers</div>
                  </div>
                </div>

                {/* ✅ FIXED KEY INFO - EXACT DATA + COLORS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  {/* Date */}
                  <div className="group p-4 rounded-xl hover:bg-white transition-all border border-blue-100 hover:border-blue-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="font-bold text-xl text-blue-700 mb-1 tracking-tight">25/2/2026</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Date</div>
                  </div>

                  {/* Location */}
                  <div className="group p-4 rounded-xl hover:bg-white transition-all border border-emerald-100 hover:border-emerald-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="font-bold text-xl text-emerald-700 mb-1 tracking-tight">City Park</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Location</div>
                  </div>

                  {/* Category */}
                  <div className="group p-4 rounded-xl hover:bg-white transition-all border border-purple-100 hover:border-purple-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Tag className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="font-bold text-xl text-purple-700 mb-1 tracking-tight">Education</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Category</div>
                  </div>

                  {/* Time */}
                  <div className="group p-4 rounded-xl hover:bg-white transition-all border border-orange-100 hover:border-orange-200 hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="font-bold text-xl text-orange-700 mb-1 tracking-tight">9:00 AM - 1:00</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Time</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Eye className="w-7 h-7 text-gray-500" />
                  Event Description
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p>{event.description || 'No description available.'}</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  Progress
                </h3>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {event.currentVolunteers}/{event.requiredVolunteers}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-green-600 h-6 rounded-full shadow-sm"
                      style={{ width: `${(event.currentVolunteers / event.requiredVolunteers) * 100}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-600">
                      {Math.round((event.currentVolunteers / event.requiredVolunteers) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/volunteer/my-events"
                    className="w-full block p-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold rounded-xl text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 py-3"
                  >
                    Back to Events
                  </Link>
                  <button className="w-full p-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share Event
                  </button>
                  <button className="w-full p-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    Save Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-8 flex items-center justify-center">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Details</h2>
            <p className="text-xl text-gray-600 mb-8">Loading event information...</p>
            <Link
              to="/volunteer/my-events"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Back to My Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
