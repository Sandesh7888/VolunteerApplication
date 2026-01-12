// src/features/organizer/pages/EditEvent.jsx - 100% FIXED
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { Loader2, X, Save, ArrowLeft } from 'lucide-react';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching event:', id);
      
      const myEvents = await apiCall('/events/myevents');
      const myEvent = myEvents.find(event => event.id == id);
      
      if (!myEvent) {
        throw new Error('Event not found or access denied');
      }
      
      setFormData(myEvent);
      console.log('✅ Event loaded:', myEvent);
    } catch (err) {
      console.error('Event fetch error:', err);
      setError('Event not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: DateTime handling for backend
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'dateTime' && value) {
      // "2025-05-25" → "2025-05-25T10:00:00"
      const isoDate = new Date(value + 'T10:00:00').toISOString().slice(0, 19);
      setFormData({ ...formData, [name]: isoDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    console.log('📤 Sending data:', formData);
    
    try {
      await apiCall(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      alert('✅ Event updated successfully!');
      navigate('/organizer/events');
    } catch (err) {
      console.error('Update error:', err);
      alert('❌ Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !formData.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center p-12 max-w-md mx-auto bg-white rounded-3xl shadow-2xl">
          <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{error || 'Event Not Found'}</h2>
          <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or you don't have permission.</p>
          <Link 
            to="/organizer/events" 
            className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-purple-700 inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} /> Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link 
          to="/organizer/events" 
          className="inline-flex items-center gap-2 mb-8 text-purple-600 hover:text-purple-700 font-semibold text-lg transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Events
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Edit Event
          </h1>
          <p className="text-gray-600 mb-8">Update event details below</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Event Title *</label>
              <input
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold text-gray-900 bg-white"
                required
              />
            </div>

            {/* Category + Volunteers */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Category *</label>
                <select 
                  name="category" 
                  value={formData.category || ''} 
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg text-gray-900 bg-white"
                  required
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
                <label className="block text-sm font-bold text-gray-700 mb-3">Required Volunteers *</label>
                <input
                  name="requiredVolunteers"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.requiredVolunteers || ''}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg text-gray-900 bg-white"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical text-lg text-gray-900 bg-white"
              />
            </div>

            {/* Date + Location */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Start Date *</label>
                <input
                  name="dateTime"
                  type="date"
                  value={formData.dateTime ? formData.dateTime.slice(0,10) : ''}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg text-gray-900 bg-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Location Name *</label>
                <input
                  name="locationName"
                  value={formData.locationName || ''}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg text-gray-900 bg-white"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                to="/organizer/events"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-8 rounded-2xl text-center transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
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
