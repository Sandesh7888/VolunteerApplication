import React, { useState, useEffect } from 'react';
import { useApi } from '../../../useApi';
import { Calendar, MapPin, Users, Loader2, ExternalLink } from 'lucide-react';

export default function EventActivity({ userId, userRole }) {
  const { apiCall } = useApi();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetch events based on user role
      if (userRole === 'VOLUNTEER') {
        const history = await apiCall(`/volunteers/history?volunteerId=${userId}`);
        const mappedEvents = history.map(h => ({
            ...h.event,
            // Use the status from history if needed, or keep event status
            joinStatus: h.status 
        }));
        setEvents(mappedEvents.slice(0, 5));
      } else {
        const myEvents = await apiCall(`/events/myevents`); // useApi adds userId
        setEvents(myEvents.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-indigo-900/5 border border-indigo-50/50">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-indigo-900/5 border border-indigo-50/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {userRole === 'VOLUNTEER' ? 'Events Joined' : 'Events Created'}
            </h3>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">
              Activity Overview
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-sm font-black">
            {events.length} Total
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">
              No events {userRole === 'VOLUNTEER' ? 'joined' : 'created'} yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div 
                key={event.id}
                className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all group cursor-pointer"
                onClick={() => window.open(`/admin/events/${event.id}`, '_blank')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </div>
                      {event.locationName && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.locationName}
                        </div>
                      )}
                      {userRole === 'ORGANIZER' && event.currentVolunteers !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {event.currentVolunteers}/{event.requiredVolunteers}
                        </div>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
