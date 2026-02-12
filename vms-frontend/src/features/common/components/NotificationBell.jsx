import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Mail, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { useApi } from '../../../useApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function NotificationBell() {
    const { apiCall } = useApi();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await apiCall(`/notifications/${user.userId}`);
            // Filter only "Event End" related notifications
            const filtered = data.filter(n => n.title === 'Event Completed' || n.title === 'Event Concluded');
            setNotifications(filtered);
            setUnreadCount(filtered.filter(n => !n.read).length);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await apiCall(`/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiCall(`/notifications/${id}?userId=${user.userId}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => {
                const notif = notifications.find(n => n.id === id);
                return notif && !notif.read ? Math.max(0, prev - 1) : prev;
            });
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Clear all notifications?")) return;
        try {
            await apiCall(`/notifications/user/${user.userId}`, { method: 'DELETE' });
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to clear all notifications", err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'EMAIL_SENT': return <Mail className="w-4 h-4 text-blue-500" />;
            case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'ERROR': return <X className="w-4 h-4 text-rose-500" />;
            default: return <Info className="w-4 h-4 text-indigo-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 bg-white hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm border border-gray-100 group"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-indigo-600 animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-gray-900 tracking-tight">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-bold">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 && (
                             <button 
                                onClick={handleClearAll}
                                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest px-3 py-1 hover:bg-rose-50 rounded-full transition-all"
                             >
                                Clear All
                             </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-bold">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id}
                                    className={`group p-4 rounded-2xl transition-all flex gap-4 ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-indigo-50/30 hover:bg-indigo-50/50 border border-indigo-100/20'}`}
                                >
                                    <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${notification.read ? 'bg-gray-50' : 'bg-white shadow-sm'}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className={`text-sm font-bold truncate ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] font-medium text-gray-400 flex-shrink-0 ml-2">
                                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                            {notification.message}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.read && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                                className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                                            title="Delete notification"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
