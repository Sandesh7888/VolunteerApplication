// src/features/volunteer/pages/VolunteerAvailableEvents.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { Calendar, MapPin, Users, Tag, CheckCircle, Loader2 } from 'lucide-react';

export default function VolunteerAvailableEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myEvents, setMyEvents] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableEvents();
    fetchMyEvents();
  }, []);

  const fetchAvailableEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/events/available', {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const eventsData = await response.json();
      setEvents(eventsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/events/myevents', {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const myEventsData = await response.json();
        setMyEvents(myEventsData);
      }
    } catch (err) {
      console.error('Failed to fetch my events:', err);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ volunteerId: user.id })
      });

      if (response.ok) {
        alert('✅ Successfully registered for this event!');
        fetchAvailableEvents();
        fetchMyEvents();
      } else {
        alert('❌ Failed to register. Event might be full.');
      }
    } catch (err) {
      alert('❌ Registration failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-green-600" />
          <p className="text-xl text-gray-600 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  const appliedEventIds = myEvents.map(event => event.id);

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Available Events
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 font-medium">Find and join events near you</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-8 shadow-lg">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Calendar className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">No events available</h3>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {events.map((event) => {
              const isApplied = appliedEventIds.includes(event.id);
              return (
                <div key={event.id} className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border border-green-100 hover:border-green-300 overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                  <div className="p-6 lg:p-8">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span className={`px-4 py-2 rounded-2xl font-bold text-sm uppercase tracking-wide shadow-md ${
                        event.status === 'PUBLISHED' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                          : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-900'
                      }`}>
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

                    {/* Details Grid */}
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
                          <Users size={16} />
                          <span>Category</span>
                        </div>
                        <div className="text-xl font-bold capitalize text-gray-900">{event.category}</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={isApplied || (event.currentVolunteers >= event.requiredVolunteers)}
                      className={`w-full py-4 px-8 rounded-2xl font-bold text-xl shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3 ${
                        isApplied 
                          ? 'bg-green-100 text-green-800 cursor-default shadow-none transform-none' 
                          : event.currentVolunteers >= event.requiredVolunteers
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed shadow-none transform-none'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl hover:shadow-3xl'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle size={20} />
                          <span>Applied</span>
                        </>
                      ) : event.currentVolunteers >= event.requiredVolunteers ? (
                        'Event Full'
                      ) : (
                        'Join Event'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
