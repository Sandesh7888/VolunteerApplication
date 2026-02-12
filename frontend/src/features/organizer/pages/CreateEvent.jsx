import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApi } from "../../../useApi";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { ShieldAlert, X, Zap, Loader2 } from "lucide-react";

export default function CreateEvent() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    locationName: "",
    address: "",
    city: "Pune",
    area: "",
    requiredVolunteers: 1,
    skillsRequired: "",
    minAge: "",
    genderPreference: "",
    regOpenDate: new Date().toISOString().split('T')[0],
    regOpenTime: "09:00",
    regCloseDate: "",
    regCloseTime: "18:00",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const { refreshUser } = useAuth();

  useEffect(() => {
     refreshUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // If start date changes, validate registration dates
      if (name === 'startDate' && value) {
        const maxEndDate = getMaxEndDate(value);
        // If current end date is after the new maximum, clear it
        if (updated.endDate && updated.endDate > maxEndDate) {
          updated.endDate = '';
        }
        // ✅ Smart Defaults for Manual Registration
        if (value && !updated.regCloseDate) {
          const closeDate = new Date(value);
          closeDate.setDate(closeDate.getDate() - 1);
          updated.regCloseDate = closeDate.toISOString().split('T')[0];
        }
      }
      
      return updated;
    });
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to get maximum end date (start date + 20 days)
  const getMaxEndDate = (startDate) => {
    if (!startDate) return getTodayDate();
    const start = new Date(startDate);
    start.setDate(start.getDate() + 20);
    return start.toISOString().split('T')[0];
  };

  // Helper function to get maximum allowed date (current year + 3 years)
  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 3);
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ SAFETY CHECK: Ensure user is logged in
      if (!user?.userId) {
         throw new Error("You must be logged in to create an event.");
      }

      if (
        !formData.title ||
        !formData.category ||
        !formData.locationName ||
        !formData.startDate ||
        !formData.requiredVolunteers
      ) {
        throw new Error("Please fill all required fields (*)");
      }

      const eventData = {
        userId: user.userId,
        title: formData.title,
        category: formData.category,
        description: formData.description || "",
        startDate: formData.startDate, 
        endDate: formData.endDate || null,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        locationName: formData.locationName,
        address: formData.address || "",
        city: formData.city || "Pune",
        area: formData.area || "",
        requiredVolunteers: Number(formData.requiredVolunteers),
        skillsRequired: formData.skillsRequired || "",
        minAge: formData.minAge ? Number(formData.minAge) : null,
        genderPreference: formData.genderPreference || "",
        registrationOpenDateTime: formData.regOpenDate ? `${formData.regOpenDate}T${formData.regOpenTime || '00:00'}:00` : null,
        registrationCloseDateTime: formData.regCloseDate ? `${formData.regCloseDate}T${formData.regCloseTime || '00:00'}:00` : null,
      };

      const response = await apiCall("/events", {
        method: "POST",
        body: JSON.stringify(eventData),
      });

      alert("Event created successfully! ✅");
      navigate("/organizer/events");
    } catch (err) {
      console.error("❌ FULL ERROR:", err);
      // Now acts on the 'message' property sent by my backend fix
      const errorMsg = err.message || "Please check your input data and try again";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const inputClass =
    "w-full px-4 py-3 bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* ... (Rest of your JSX remains the same as provided) ... */}
      <div className="max-w-4xl mx-auto">
        <Link
          to="/organizer/dashboard"
          className="inline-flex items-center px-4 py-2 mb-8 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all border border-purple-200 hover:border-purple-300 shadow-sm text-purple-700 font-medium"
        >
          ← Back to Dashboard
        </Link>
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-purple-200">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Create New Event
            </h1>
            <p className="text-gray-600">
              Fill out all required fields marked with *
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <X className="w-4 h-4" />
              </div>
              {error}
            </div>
          )}
          {!user?.documentsVerified && (
            <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 px-6 py-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center gap-6 shadow-sm shadow-amber-100">
              <div className="w-16 h-16 bg-amber-400 text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-black tracking-tight mb-1">Organization Verification Required</h3>
                <p className="text-sm font-medium text-amber-800 leading-relaxed">
                  To maintain the quality of our ecosystem, organizers must verify their identity before hosting events. 
                  Please visit your **Profile** to upload the required documents.
                </p>
              </div>
              <Link to="/organizer/profile" className="px-6 py-3 bg-amber-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-md">
                Verify Now
              </Link>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Basic Info */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                name="title"
                type="text"
                placeholder="e.g. Community Clean-up Drive"
                className={inputClass}
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                className={`${inputClass} bg-white text-gray-900`}
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
              >
                 <option value="">Select Category</option>
                <option value="Cleanup">Cleanup</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Awareness">Awareness Program</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                placeholder="Describe your event..."
                className={inputClass}
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {/* Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                name="startDate"
                type="date"
                className={inputClass}
                value={formData.startDate}
                onChange={handleChange}
                min={getTodayDate()}
                max={getMaxDate()}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                name="endDate"
                type="date"
                className={inputClass}
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || getTodayDate()}
                max={formData.startDate ? getMaxEndDate(formData.startDate) : getMaxDate()}
                disabled={loading || !formData.startDate}
                title={!formData.startDate ? "Please select start date first" : "Maximum 20 days from start date"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                name="startTime"
                type="time"
                className={inputClass}
                value={formData.startTime}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                name="endTime"
                type="time"
                className={inputClass}
                value={formData.endTime}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            {/* Registration Window - Restored Manual Controls */}
            <div className="md:col-span-2 mt-4 pt-4 border-t border-purple-100">
              <h3 className="text-lg font-semibold text-purple-700 mb-4">Registration Window</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Open Date
                  </label>
                  <input
                    name="regOpenDate"
                    type="date"
                    className={inputClass}
                    value={formData.regOpenDate}
                    onChange={handleChange}
                    min={getTodayDate()}
                    max={formData.startDate || getMaxDate()}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Open Time
                  </label>
                  <input
                    name="regOpenTime"
                    type="time"
                    className={inputClass}
                    value={formData.regOpenTime}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Close Date *
                  </label>
                  <input
                    name="regCloseDate"
                    type="date"
                    className={inputClass}
                    value={formData.regCloseDate}
                    onChange={handleChange}
                    min={formData.regOpenDate || getTodayDate()}
                    max={formData.startDate || getMaxDate()}
                    required
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-gray-500">Must be on or before event start date</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Close Time
                  </label>
                  <input
                    name="regCloseTime"
                    type="time"
                    className={inputClass}
                    value={formData.regCloseTime}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name *
              </label>
              <input
                name="locationName"
                type="text"
                placeholder="e.g. City Park"
                className={inputClass}
                value={formData.locationName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address
              </label>
              <input
                name="address"
                type="text"
                placeholder="123 Main Street"
                className={inputClass}
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                name="city"
                type="text"
                className={inputClass}
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area/Zone
              </label>
              <input
                name="area"
                type="text"
                placeholder="e.g. Koregaon Park"
                className={inputClass}
                value={formData.area}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {/* Volunteer Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Volunteers *
              </label>
              <input
                name="requiredVolunteers"
                type="number"
                min="1"
                max="100"
                className={inputClass}
                value={formData.requiredVolunteers}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Required (optional)
              </label>
              <input
                name="skillsRequired"
                type="text"
                placeholder="e.g. Photography, First Aid"
                className={inputClass}
                value={formData.skillsRequired}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !user?.documentsVerified}
              className={`md:col-span-2 py-5 px-8 rounded-2xl text-lg font-black shadow-xl transition-all duration-300 transform w-full flex items-center justify-center gap-3 ${
                loading || !user?.documentsVerified
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-2xl hover:-translate-y-1 active:translate-y-0'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6" />
                  Processing...
                </>
              ) : !user?.documentsVerified ? (
                <>
                  <ShieldAlert className="w-6 h-6" />
                  Verification Required
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 fill-white" />
                  Launch Event
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}