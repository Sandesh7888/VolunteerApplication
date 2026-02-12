// src/features/admin/layout/DashboardLayout.jsx
// ✅ FIXED: Sidebar toggle works on DESKTOP + MOBILE
// ✅ Sidebar hidden by default on all devices

import React, { useState, useCallback } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { X, Menu, User } from 'lucide-react';
import NotificationBell from '../../common/components/NotificationBell';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Sidebar state (works for all screen sizes)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", color: "text-indigo-500" },
    { name: 'Events', href: '/admin/events', iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-emerald-500" },
    { name: 'Volunteers', href: '/admin/volunteers', iconPath: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "text-blue-500" },
    { name: 'Organizers', href: '/admin/organizers', iconPath: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a1.875 1.875 0 01-2.652 0L6.854 12.312a1.875 1.875 0 112.653-2.653l5.355 5.355z", color: "text-purple-500" },
    { name: 'Events Approval', href: '/admin/events-approval', iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-amber-500" },
    { name: 'Reports', href: '/admin/reports', iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "text-orange-500" },

    { name: 'Support Tickets', href: '/admin/support-tickets', iconPath: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", color: "text-cyan-500" },
    { name: 'Doc Verification', href: '/admin/document-verification', iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "text-blue-600" },
    { name: 'Settings', href: '/admin/settings', iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37z", color: "text-gray-500" },
  ];

  const isActive = (href) =>
    location.pathname === href ||
    (href === '/admin/events' && location.pathname.includes('/admin/events')) ||
    (href === '/admin/events-approval' && location.pathname.includes('events-approval'));

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-indigo-50 overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-xl shadow-sm border-b border-indigo-100/30 h-16 flex items-center justify-between px-4 lg:px-6 z-[70]">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-indigo-100 transition-all w-10 h-10 flex items-center justify-center"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-indigo-600" /> : <Menu className="w-5 h-5 text-indigo-600" />}
          </button>

          <Link
            to="/admin/dashboard"
            className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent"
          >
            Admin Panel
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-indigo-100">
            <User className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-bold text-gray-900 hidden sm:block capitalize">
              {user?.name || 'Admin'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* OVERLAY (mobile only) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR (desktop + mobile toggle) */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-[65] w-72 
            bg-white/95 backdrop-blur-xl shadow-2xl border-r
            transform transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <nav className="h-full p-4 pt-6 mt-15 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-all
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-indigo-50'}
                `}
              >
                <svg
                  className={`w-5 h-5 mr-3 ${item.color} ${isActive(item.href) ? 'text-white' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                </svg>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
