// src/features/organizer/pages/EditEvent.jsx - WORKING + BEAUTIFUL STYLE
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { Loader2, X, Save, ArrowLeft } from 'lucide-react';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const { user: authUser } = useAuth(); // ✅ ADDED

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = authUser?.role === 'ADMIN';

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError('');

      let eventData;
      try {
        // ✅ ADMINS CAN FETCH ANY EVENT DIRECTLY
        eventData = await apiCall(`/events/details/${id}`);
      } catch (err) {
        // Fallback for organizers
        const myEvents = await apiCall('/events/myevents');
        eventData = myEvents.find(event => String(event.id) === String(id));
      }

      if (!eventData) {
        throw new Error('Event not found or access denied');
      }

      setFormData({
        ...eventData,
        startDate: (eventData.startDate || eventData.dateTime) ? String(eventData.startDate || eventData.dateTime).slice(0, 10) : '',
        endDate: eventData.endDate ? String(eventData.endDate).slice(0, 10) : '',
        startTime: eventData.startTime ? String(eventData.startTime).slice(0, 5) : '', 
        endTime: eventData.endTime ? String(eventData.endTime).slice(0, 5) : '',
        regOpenDate: eventData.registrationOpenDateTime ? String(eventData.registrationOpenDateTime).slice(0, 10) : '',
        regOpenTime: eventData.registrationOpenDateTime ? String(eventData.registrationOpenDateTime).slice(11, 16) : '09:00',
        regCloseDate: eventData.registrationCloseDateTime ? String(eventData.registrationCloseDateTime).slice(0, 10) : '',
        regCloseTime: eventData.registrationCloseDateTime ? String(eventData.registrationCloseDateTime).slice(11, 16) : '18:00',
      });

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Event not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // ✅ Use authUser.userId for the request
      await apiCall(`/events/${id}?userId=${authUser.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          registrationOpenDateTime: formData.regOpenDate ? `${formData.regOpenDate}T${formData.regOpenTime || '00:00'}:00` : null,
          registrationCloseDateTime: formData.regCloseDate ? `${formData.regCloseDate}T${formData.regCloseTime || '00:00'}:00` : null,
        })
      });

      alert('✅ Event updated successfully!');
      navigate(isAdmin ? '/admin/events' : '/organizer/events');
    } catch (err) {
      console.error('Update error:', err);
      alert('❌ Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- LOADING STATE -------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
          <p className="text-xl text-gray-600 font-medium">Loading event...</p>
        </div>
      </div>
    );
  }

  /* -------------------- ERROR STATE -------------------- */
  if (error || !formData.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center p-12 max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200">
          <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{error || 'Event Not Found'}</h2>
          <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or you don't have permission.</p>
          <Link 
            to={isAdmin ? "/admin/events" : "/organizer/events"} 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            {isAdmin ? "Back to Admin Events" : "Back to Events"}
          </Link>
        </div>
      </div>
    );
  }

  /* -------------------- MAIN FORM - BEAUTIFUL STYLE -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* BACK BUTTON */}
        <Link
          to={isAdmin ? "/admin/events" : "/organizer/events"}
          className="inline-flex items-center px-6 py-3 mb-8 bg-white/90 backdrop-blur-sm rounded-2xl hover:bg-white transition-all border border-purple-200 hover:border-purple-300 shadow-sm text-purple-700 font-semibold text-lg"
        >
          <ArrowLeft size={20} className="mr-2" />
          {isAdmin ? "Back to Admin Events" : "Back to Events"}
        </Link>

        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border border-purple-200">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Edit Event
            </h1>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
              Update your event details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid text-black grid-cols-1 md:grid-cols-2 gap-8">
            {/* Event Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Event Title *
              </label>
              <input
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white text-lg text-gray-900 placeholder-gray-500 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm"
                placeholder="Event Title"
              />
            </div>

            {/* Category + Required Volunteers */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category *
              </label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white text-lg text-gray-900 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm"
              >
                <option value="">Select Category</option>
                <option value="Cleanup">Cleanup</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Awareness">Awareness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Required Volunteers *
              </label>
              <input
                type="number"
                name="requiredVolunteers"
                min="1"
                max="100"
                value={formData.requiredVolunteers || ''}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white text-lg text-gray-900 placeholder-gray-500 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm"
                placeholder="10"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white text-lg text-gray-900 placeholder-gray-500 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-vertical transition-all duration-200 hover:border-purple-300 shadow-sm"
                placeholder="Tell us about your event..."
              />
            </div>

            {/* Start Date + Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate || ''}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white text-lg text-gray-900 placeholder-gray-500 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Location Name *
              </label>
              <input
                name="locationName"
                value={formData.locationName || ''}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white text-lg text-gray-900 placeholder-gray-500 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm"
                placeholder="City Park, Pune"
              />
            </div>

            {/* Registration Window - Restored Manual Controls */}
            <div className="md:col-span-2 mt-8 pt-8 border-t border-purple-100">
              <h3 className="text-2xl font-bold text-purple-700 mb-6">Registration Window</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Registration Open Date
                  </label>
                  <input
                    name="regOpenDate"
                    type="date"
                    className="w-full px-6 py-4 bg-white text-lg text-gray-900 placeholder-gray-500 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm"
                    value={formData.regOpenDate || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Registration Open Time
                  </label>
                  <input
                    name="regOpenTime"
                    type="time"
                    className="w-full px-6 py-4 bg-white text-lg text-gray-900 placeholder-gray-500 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm"
                    value={formData.regOpenTime || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Registration Close Date *
                  </label>
                  <input
                    name="regCloseDate"
                    type="date"
                    className="w-full px-6 py-4 bg-white text-lg text-gray-900 placeholder-gray-500 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm"
                    value={formData.regCloseDate || ''}
                    onChange={handleChange}
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500 font-medium">Must be on or before event start date</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Registration Close Time
                  </label>
                  <input
                    name="regCloseTime"
                    type="time"
                    className="w-full px-6 py-4 bg-white text-lg text-gray-900 placeholder-gray-500 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm"
                    value={formData.regCloseTime || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-8">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 px-8 rounded-2xl text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={24} />
                    <span>Update Event</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
