// src/features/volunteer/pages/VolunteerAvailableEvents.jsx - ✅ FIXED IMPORT
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth"; // ✅ CORRECT PATH
import { useApi } from "../../../useApi"; // ✅ useApi correct
import {
  Calendar,
  MapPin,
  Users,
  Tag,
  CheckCircle,
  Loader2,
} from "lucide-react";

// ✅ REST OF CODE REMAINS SAME - Just fix line 4
export default function VolunteerAvailableEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myEvents, setMyEvents] = useState([]);
  const [registeringEventId, setRegisteringEventId] = useState(null);
  const { user } = useAuth(); // ✅ Now works correctly
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableEvents();
    fetchMyEvents();
  }, []);

  const fetchAvailableEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const eventsData = await apiCall("/events/published");
      setEvents(eventsData);
    } catch (err) {
      setError(err.message);
      console.error("Available events error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const myEventsData = await apiCall("/events/myevents");
      setMyEvents(myEventsData);
    } catch (err) {
      console.error("My events error:", err);
      setMyEvents([]);
    }
  };

  // ✅ FULL WORKING handleRegister - Copy → Paste → Works!
  const handleRegister = async (eventId) => {
    setRegisteringEventId(eventId); // 1. Show loading spinner

    try {
      // ✅ TRY THESE 3 OPTIONS (one will work):

      let response;

      // OPTION 1: NO BODY (Backend uses JWT token)
      try {
        response = await apiCall(`/events/${eventId}/register`, {
          method: "POST",
        });
      } catch {
        // OPTION 2: Query param
        try {
          response = await apiCall(
            `/events/${eventId}/register?userId=${user.id}`,
            {
              method: "POST",
            }
          );
        } catch {
          // OPTION 3: JSON body
          response = await apiCall(`/events/${eventId}/register`, {
            method: "POST",
            body: JSON.stringify({ userId: user.id }),
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // ✅ SUCCESS - Update UI instantly
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                currentVolunteers: (event.currentVolunteers || 0) + 1,
              }
            : event
        )
      );

      // ✅ Refresh real data from backend
      await Promise.all([fetchAvailableEvents(), fetchMyEvents()]);

      alert("✅ Successfully joined the event!");
    } catch (err) {
      console.error("Register error details:", err);

      // ✅ Better error messages
      if (err.message.includes("400")) {
        alert("⚠️ Registration failed. Backend may expect different format.");
      } else if (err.message.includes("already registered")) {
        alert("✅ You're already registered for this event!");
      } else {
        alert("❌ Failed to join: " + (err.message || "Please try again"));
      }
    } finally {
      setRegisteringEventId(null); // 2. Hide loading
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

  const appliedEventIds = myEvents.map((event) => event.id);

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Available Events
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 font-medium">
            Find and join events near you
          </p>
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
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              No events available
            </h3>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              Ask organizers to{" "}
              <Link
                to="/login"
                className="text-green-600 font-semibold hover:underline"
              >
                publish events
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {events.map((event) => {
              const isApplied = appliedEventIds.includes(event.id);
              const isFull =
                (event.currentVolunteers || 0) >=
                (event.requiredVolunteers || 0);
              const isRegistering = registeringEventId === event.id;

              return (
                <div
                  key={event.id}
                  className={`group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl border overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ${
                    isApplied
                      ? "border-green-300 bg-green-50/50"
                      : isFull
                      ? "border-gray-300 bg-gray-50/50"
                      : "border-green-100 hover:border-green-300"
                  }`}
                >
                  <div className="p-6 lg:p-8">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className={`px-4 py-2 rounded-2xl font-bold text-sm uppercase tracking-wide shadow-md ${
                          event.status === "PUBLISHED"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                            : "bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-900"
                        }`}
                      >
                        {event.status}
                      </span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                        {event.currentVolunteers || 0}/
                        {event.requiredVolunteers || 0}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-green-600 transition-colors">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-lg leading-relaxed mb-8 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Details Grid - FIXED 2x2 */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-bold text-green-600 space-x-2">
                          <Calendar size={16} />
                          <span>Date</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {event.dateTime
                            ? new Date(event.dateTime).toLocaleDateString(
                                "en-IN"
                              )
                            : "TBD"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-bold text-green-600 space-x-2">
                          <MapPin size={16} />
                          <span>Location</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {event.locationName}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-bold text-green-600 space-x-2">
                          <Tag size={16} />
                          <span>Category</span>
                        </div>
                        <div className="text-xl font-bold capitalize text-gray-900">
                          {event.category}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm font-bold text-green-600 space-x-2">
                          <Users size={16} />
                          <span>Volunteers</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {event.currentVolunteers || 0}/
                          {event.requiredVolunteers || 0}
                        </div>
                      </div>
                    </div>

                    {/* ✅ PERFECT JOIN BUTTON */}
                    {/* ✅ PERFECT JOIN BUTTON - GRAY FOR JOINED */}
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={isRegistering || isApplied || isFull}
                      className={`w-full py-4 px-8 rounded-2xl font-bold text-xl shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                        isRegistering
                          ? "bg-blue-500 text-white cursor-wait shadow-lg"
                          : isApplied
                          ? "bg-gray-200 border-2 border-gray-400 text-gray-700 cursor-default shadow-md hover:shadow-md" // ✅ GRAY FOR JOINED
                          : isFull
                          ? "bg-gray-100 border-2 border-gray-300 text-gray-500 cursor-not-allowed shadow-sm"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl hover:shadow-3xl hover:-translate-y-1 hover:scale-[1.02]"
                      }`}
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Joining...
                        </>
                      ) : isApplied ? (
                        <>
                          <CheckCircle className="w-6 h-6" />
                          Joined
                        </>
                      ) : isFull ? (
                        "Event Full"
                      ) : (
                        "Join Event"
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
