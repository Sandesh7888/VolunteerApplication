// src/features/volunteer/pages/VolunteerDashboard.jsx
import React from 'react';

const VolunteerDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Volunteer Dashboard</h1>
      <div className="bg-black rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4">Upcoming Events</h3>
        <p>Find events near you...</p>
        <a href="/volunteer/events" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg">
          Browse Events
        </a>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
