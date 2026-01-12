// src/features/organizer/pages/OrganizerEvents.jsx - ROW TABLE
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../../useApi";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { apiCall } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const eventsData = await apiCall("/events/myevents");
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Delete this event permanently?")) return;
    try {
      await apiCall(`/events/${eventId}`, { method: "DELETE" });
      alert("✅ Event deleted successfully!");
      fetchMyEvents();
    } catch (err) {
      alert("❌ Delete failed: " + err.message);
    }
  };

  const handlePublish = async (eventId) => {
    try {
      await apiCall(`/events/${eventId}/publish`, { method: "PATCH" });
      alert("✅ Event published successfully!");
      fetchMyEvents();
    } catch (err) {
      console.error("Publish error:", err);
      alert("❌ Publish failed: " + err.message);
    }
  };

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchTerm("");
    }
    setSearchOpen(!searchOpen);
  };

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
          <p className="text-xl text-gray-600">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 leading-tight">
              My Events
            </h1>
            <p className="text-xl text-gray-700">
              Manage all your created events
            </p>
          </div>

          <div className="flex items-center space-x-4 self-start lg:self-auto">
            {searchOpen ? (
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events by title..."
                  className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 shadow-sm text-gray-900 placeholder-gray-500 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={toggleSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-all duration-200"
                >
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            ) : (
              <button
                onClick={toggleSearch}
                className="w-14 h-14 flex-shrink-0 bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 flex items-center justify-center group"
                title="Search events"
              >
                <Search
                  size={20}
                  className="text-purple-600 group-hover:scale-110 transition-transform duration-200"
                />
              </button>
            )}

            <Link
              to="/organizer/create-event"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-3 flex-shrink-0"
            >
              <Plus
                size={20}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              <span>Create New Event</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 shadow-sm">
            {error}
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Plus className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              No Events {searchTerm ? "Match" : "Created"}
            </h3>
            <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
              {searchTerm
                ? `No events found matching "${searchTerm}"`
                : "Start by creating your first community event"}
            </p>
            <Link
              to="/organizer/create-event"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-4 rounded-xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>
                {searchTerm ? "Try Different Search" : "Launch First Event"}
              </span>
            </Link>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
            {/* ✅ ROW TABLE FORMAT */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
                  <tr>
                    <th className="px-8 py-6 text-left text-lg font-bold text-gray-900 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-6 text-left text-lg font-bold text-gray-900 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-6 text-left text-lg font-bold text-gray-900 uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="px-6 py-6 text-left text-lg font-bold text-gray-900 uppercase tracking-wider hidden lg:table-cell">
                      Location
                    </th>
                    <th className="px-6 py-6 text-left text-lg font-bold text-gray-900 uppercase tracking-wider hidden xl:table-cell">
                      Volunteers
                    </th>
                    <th className="px-6 py-6 text-right text-lg font-bold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-6 text-right text-lg font-bold text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-purple-50 transition-colors duration-200 group"
                    >
                      {/* Title */}
                      <td className="px-8 py-6 font-semibold text-xl text-gray-900 max-w-md truncate">
                        {event.title}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-6">
                        <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-xl font-bold uppercase text-sm tracking-wide">
                          {event.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-6 hidden md:table-cell font-bold text-lg text-gray-900">
                        {event.startDate
                          ? new Date(event.startDate).toLocaleDateString(
                              "en-IN"
                            )
                          : "TBD"}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-6 hidden lg:table-cell font-semibold text-gray-900 max-w-xs truncate">
                        {event.locationName}
                      </td>

                      {/* Volunteers */}
                      <td className="px-6 py-6 hidden xl:table-cell">
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold">
                          {event.currentVolunteers || 0}/
                          {event.requiredVolunteers || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6 text-right">
                        <span
                          className={`px-4 py-2 rounded-xl font-bold uppercase text-sm tracking-wide ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {event.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6 text-right space-x-2">
                        {event.status === "DRAFT" && (
                          <button
                            onClick={() => handlePublish(event.id)}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-1 text-sm font-bold"
                            title="Publish"
                          >
                            <CheckCircle size={16} />
                            <span className="hidden sm:inline">Publish</span>
                          </button>
                        )}
                       
                        <button
                          onClick={() => {
                            console.log(
                              "🔍 Editing event:",
                              event.id,
                              event.title
                            ); // DEBUG
                            navigate(`/organizer/events/${event.id}/edit`);
                          }}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-1 text-sm font-bold"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                          <span className="hidden md:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          id="deleterecord_dtn"
                          className=" p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center space-x-1 text-sm font-bold"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          <span className="hidden md:inline">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
