import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Users, Calendar, Building2, Info, Mail, LogIn, UserPlus } from 'lucide-react';

const navItems = [
  { name: 'Home', path: '/', icon: null },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Volunteers', path: '/volunteers', icon: Users },
  { name: 'Organizations', path: '/organizations', icon: Building2 },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Contact', path: '/contact', icon: Mail }
];

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-xl z-50 border-b border-emerald-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              VolunteerHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-emerald-600 font-medium rounded-xl hover:bg-emerald-50/50 transition-all duration-200 group"
              >
                {item.icon && <item.icon className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="flex items-center space-x-2 px-5 py-2.5 text-emerald-600 font-semibold border-2 border-emerald-200 rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-4 border-t border-emerald-100">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-emerald-600 font-medium hover:bg-emerald-50 rounded-xl transition-all duration-200 mt-2"
                onClick={() => setIsOpen(false)}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
