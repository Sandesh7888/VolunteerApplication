// src/features/volunteer/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  Menu, X, LayoutDashboard, Calendar, CheckCircle, User, LogOut, 
  Clock, LifeBuoy, Settings, Award 
} from 'lucide-react';
import NotificationBell from '../../common/components/NotificationBell';

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/volunteer/dashboard', icon: LayoutDashboard },
    { name: 'Browse Events', href: '/volunteer/browse-events', icon: Calendar },
    { name: 'My Events', href: '/volunteer/my-events', icon: CheckCircle },
    { name: 'Certificates', href: '/volunteer/certificates', icon: Award }, // Added Certificates
    { name: 'History', href: '/volunteer/history', icon: Clock },
    { name: 'Help & Support', href: '/volunteer/support', icon: LifeBuoy },
    { name: 'Profile', href: '/volunteer/profile', icon: User },
    { name: 'Settings', href: '/volunteer/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* NAVBAR WITH HAMBURGER */}
      <nav className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-emerald-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* LEFT: Hamburger + Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-all"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link 
              to="/volunteer/dashboard" 
              className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
            >
              Volunteer Hub
            </Link>
          </div>

          {/* RIGHT: User + Logout */}
          <div className="flex items-center space-x-3">
            <NotificationBell />
            <div className="flex items-center space-x-3">
              <span className="font-bold text-gray-900 hidden lg:block capitalize">{user?.name}</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                Volunteer
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <LogOut size={18} />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* SIDEBAR - ONLY SHOWS WHEN CLICKED */}
      {menuOpen && (
        <>
          {/* BACKDROP */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* SIDEBAR PANEL - Positioned below navbar (top-16) */}
          <aside className="fixed top-16 left-0 w-72 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-xl shadow-2xl border-r border-emerald-100 z-50 transform transition-all duration-300 translate-x-0 flex flex-col">
            {/* Navigation Menu */}
            <nav className="p-4 flex-1 space-y-1.5 overflow-y-auto no-scrollbar pt-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center p-3.5 rounded-2xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-gray-600 hover:bg-emerald-50/80 hover:text-emerald-700'
                    }`}
                  >
                    <Icon 
                      size={22} 
                      className={`mr-4 flex-shrink-0 transition-transform duration-300 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:scale-110 group-hover:text-emerald-600'
                      }`} 
                    />
                    <span className={`text-base font-bold tracking-tight ${isActive ? 'text-white' : 'text-gray-700'}`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Subtle Info */}
            <div className="p-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 select-none">
                Volunteer Portal v2.0
              </p>
            </div>
          </aside>
        </>
      )}

      {/* MAIN CONTENT - FULL WIDTH */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
