// src/features/volunteer/pages/VolunteerMyEvents.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { Calendar, MapPin, Users, Tag, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';

export default function VolunteerMyEvents() {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:8080/api/events/myevents', {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch your events');
      }

      const eventsData = await response.json();
      setMyEvents(eventsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'from-green-500 to-emerald-600 text-white';
      case 'PENDING': return 'from-yellow-500 to-amber-600 text-gray-900';
      case 'REJECTED': return 'from-red-500 to-rose-600 text-white';
      case 'COMPLETED': return 'from-blue-500 to-indigo-600 text-white';
      default: return 'from-gray-500 to-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-green-600" />
          <p className="text-xl text-gray-600 font-medium">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            My Events
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 font-medium">Events you applied for</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-8 shadow-lg">
            {error}
          </div>
        )}

        {myEvents.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Calendar className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">No events applied</h3>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              Join events from <Link to="/volunteer/events" className="text-green-600 font-semibold hover:underline">Available Events</Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {myEvents.map((event) => (
              <div key={event.id} className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-green-100 hover:border-green-300 overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                <div className="p-6 lg:p-8">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-4 py-2 rounded-2xl font-bold text-sm uppercase tracking-wide shadow-md ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      {event.currentVolunteers || 0}/{event.requiredVolunteers || 0}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-green-600 transition-colors">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-lg leading-relaxed mb-8 line-clamp-3">{event.description}</p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-bold text-green-600 space-x-2">
                        <Calendar size={16} />
                        <span>Date</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN') : 'TBD'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-bold text-green-600 space-x-2">
                        <MapPin size={16} />
                        <span>Location</span>
                      </div>
                      <div className="text-xl font-bold text-gray-900">{event.locationName}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-bold text-green-600 space-x-2">
                        <Tag size={16} />
                        <span>Category</span>
                      </div>
                      <div className="text-xl font-bold capitalize text-gray-900">{event.category}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm font-bold text-green-600 space-x-2">
                        <Users size={16} />
                        <span>Status</span>
                      </div>
                      <div className="text-xl font-bold capitalize text-gray-900">{event.status}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
