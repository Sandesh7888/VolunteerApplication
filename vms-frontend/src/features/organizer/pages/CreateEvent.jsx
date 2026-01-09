import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApi } from "../../../useApi";
import { useAuth } from "../../../features/auth/hooks/useAuth";

export default function CreateEvent() {
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { apiCall } = useApi();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);

    if (!isValidDate(formData.startDate)) {
      setLoading(false);
      setError("Invalid start date format");
      return;
    }

    if (formData.endDate && !isValidDate(formData.endDate)) {
      setLoading(false);
      setError("Invalid end date format");
      return;
    }

    try {
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
        title: formData.title,
        category: formData.category,
        locationName: formData.locationName,
        startDate: formData.startDate,
        city: formData.city,
        description: formData.description || null,
        requiredVolunteers: parseInt(formData.requiredVolunteers),
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        endDate: formData.endDate || null,
        address: formData.address || null,
        area: formData.area || null,
        skillsRequired: formData.skillsRequired || null,
        minAge: formData.minAge ? parseInt(formData.minAge) : null,
        genderPreference: formData.genderPreference || null,
      };

      console.log("SENDING:", JSON.stringify(eventData, null, 2));

      await apiCall("/events", {
        method: "POST",
        body: JSON.stringify(eventData),
      });

      alert("Event created successfully!");
      navigate("/organizer/events");
    } catch (err) {
      console.error("ERROR:", err);
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/90 backdrop-blur-sm text-gray-900 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all duration-200 hover:border-purple-300 shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ✅ BACK BUTTON - Matches Dashboard style */}
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className={`${inputClass} bg-white`}
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
                disabled={loading}
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
              disabled={loading}
              className="md:col-span-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 w-full"
            >
              {loading ? "Creating Event..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
