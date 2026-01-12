// src/features/admin/layout/DashboardLayout.jsx - HAMBURGER + COLLAPSIBLE SIDEBAR
import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* ✅ HEADER WITH HAMBURGER */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* ✅ HAMBURGER BUTTON */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-xl hover:bg-indigo-100 transition-all lg:w-12 lg:h-12 flex lg:hidden items-center justify-center"
              >
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link to="/admin/dashboard" className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Admin Panel
              </Link>
              
              {/* Admin Name */}
              <span className="text-sm bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 px-6 py-2 rounded-full font-semibold border border-emerald-200 shadow-md hidden md:block">
                👨‍💼 {user?.name || 'Admin'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold px-8 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ✅ COLLAPSIBLE SIDEBAR */}
        <aside className={`bg-white/70 backdrop-blur-xl border-r border-indigo-100 shadow-2xl transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-72'
        } overflow-hidden`}>
          <nav className="mt-12 px-6 h-full">
            <div className={`transition-all duration-300 ${!isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
              <Link
                to="/admin/dashboard"
                className="flex items-center px-4 py-4 text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-semibold mb-3 transition-all duration-300 shadow-sm hover:shadow-md w-full"
              >
                <svg className="w-6 h-6 mr-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="transition-all duration-300">Dashboard</span>
              </Link>

              <Link
                to="/admin/events"
                className="flex items-center px-4 py-4 text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-semibold mb-3 transition-all duration-300 shadow-sm hover:shadow-md w-full"
              >
                <svg className="w-6 h-6 mr-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="transition-all duration-300">Events</span>
              </Link>

              <Link
                to="/admin/volunteers"
                className="flex items-center px-4 py-4 text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-semibold mb-3 transition-all duration-300 shadow-sm hover:shadow-md w-full"
              >
                <svg className="w-6 h-6 mr-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="transition-all duration-300">Volunteers</span>
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center px-4 py-4 text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-semibold mb-3 transition-all duration-300 shadow-sm hover:shadow-md w-full"
              >
                <svg className="w-6 h-6 mr-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="transition-all duration-300">Users</span>
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center px-4 py-4 text-gray-700 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-semibold transition-all duration-300 shadow-sm hover:shadow-md w-full"
              >
                <svg className="w-6 h-6 mr-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="transition-all duration-300">Reports</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-8 overflow-auto transition-all duration-300 ${isSidebarOpen ? '' : 'lg:ml-0'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
