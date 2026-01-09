// src/features/admin/pages/AdminDashboard.jsx
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Events</h3>
            <p className="text-3xl font-bold text-blue-600">124</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Organizers</h3>
            <p className="text-3xl font-bold text-green-600">23</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Volunteers</h3>
            <p className="text-3xl font-bold text-purple-600">456</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
            <p className="text-3xl font-bold text-orange-600">5</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Recent Events</h3>
            <ul className="space-y-2">
              <li className="flex justify-between py-2 border-b">
                <span>Tech Workshop</span>
                <span className="text-green-600 font-medium">Approved</span>
              </li>
              <li className="flex justify-between py-2 border-b">
                <span>Food Drive</span>
                <span className="text-orange-600 font-medium">Pending</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/admin/events" className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all">
                Manage Events
              </a>
              <a href="#" className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-all">
                Approve Organizers
              </a>
              <a href="#" className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-all">
                View Reports
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
