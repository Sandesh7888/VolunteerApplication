import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useApi } from "../../../useApi"; 
import { Activity, CheckCircle2, FileText, Users, Loader2, Users2, Calendar, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getEventStatus } from '../../../utils/formatters';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const { apiCall } = useApi();
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    pendingRequests: 0,
    totalVolunteers: 0
  });
  const [activeEvents, setActiveEvents] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const myEvents = await apiCall(`/events/myevents?userId=${user?.userId}`);
      
      // Process stats
      const totalEvents = myEvents.length;
      const publishedEvents = myEvents.filter(e => e.status === 'PUBLISHED').length;
      
      let totalPending = 0;
      for (const event of myEvents) {
        try {
          const volunteers = await apiCall(`/events/${event.id}/volunteers`);
          totalPending += volunteers.filter(v => v.status === 'PENDING').length;
        } catch (err) {
          console.error(`Error fetching volunteers for event ${event.id}:`, err);
        }
      }
      
      setStats({
        totalEvents,
        publishedEvents,
        pendingRequests: totalPending,
        totalVolunteers: myEvents.reduce((sum, e) => sum + (e.currentVolunteers || 0), 0)
      });

      // Process Active Events (Strict LIVE checking)
      const active = myEvents.filter(event => {
        const status = getEventStatus(
          event.startDate, 
          event.endDate, 
          event.startTime, 
          event.endTime,
          event.status
        );
        return status === 'LIVE';
      }).slice(0, 3);
      setActiveEvents(active);

      // Process Chart Data (Events by Category)
      const categoryCounts = myEvents.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {});
      
      const chartArr = Object.keys(categoryCounts).map(cat => ({
        name: cat,
        count: categoryCounts[cat]
      }));
      setChartData(chartArr);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
          <p className="text-xl text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Organizer <span className="text-purple-600">Dashboard</span></h1>
            <p className="text-slate-500 font-medium">Manage your community impact projects</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-600">System Live</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Events', value: stats.totalEvents, icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-50' },
            { label: 'Published', value: stats.publishedEvents, icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
            { label: 'Pending Apps', value: stats.pendingRequests, icon: Users, color: 'text-amber-600', bgColor: 'bg-amber-50' },
            { label: 'Volunteers', value: stats.totalVolunteers, icon: Users2, color: 'text-indigo-600', bgColor: 'bg-indigo-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <stat.icon size={22} className={stat.color} />
                </div>
              </div>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Activity className="text-purple-500" size={20} />
              Events by Category
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Events List */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Clock className="text-emerald-500" size={20} />
              Active Now
            </h3>
            <div className="space-y-4">
              {activeEvents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium italic">No events active right now</p>
                </div>
              ) : (
                activeEvents.map((event) => (
                  <div key={event.id} className="p-4 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all group">
                    <h4 className="font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">{event.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(event.startDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 text-emerald-600"><Activity size={12} /> {event.category}</span>
                    </div>
                  </div>
                ))
              )}
              <Link to="/organizer/events" className="flex items-center justify-center gap-2 w-full py-4 mt-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all text-sm">
                View All Events <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/organizer/create-event" 
            className="flex items-center gap-5 p-6 bg-purple-600 hover:bg-purple-700 rounded-3xl text-white shadow-lg shadow-purple-200 transition-all hover:-translate-y-1"
          >
            <div className="p-3 bg-white/20 rounded-2xl whitespace-nowrap">
              <Activity size={24} />
            </div>
            <div>
              <p className="font-black text-lg leading-tight text-nowrap">Create Event</p>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest whitespace-nowrap">Start Impact</p>
            </div>
          </Link>

          <Link 
            to="/organizer/events" 
            className="flex items-center gap-5 p-6 bg-slate-900 hover:bg-slate-800 rounded-3xl text-white shadow-lg shadow-slate-200 transition-all hover:-translate-y-1"
          >
            <div className="p-3 bg-white/10 rounded-2xl whitespace-nowrap">
              <FileText size={24} />
            </div>
            <div>
              <p className="font-black text-lg leading-tight whitespace-nowrap">Manage Projects</p>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest whitespace-nowrap">View List</p>
            </div>
          </Link>

          <Link 
            to="/organizer/events" 
            className="flex items-center gap-5 p-6 bg-white hover:bg-slate-50 rounded-3xl text-slate-900 border border-slate-100 shadow-sm transition-all hover:-translate-y-1"
          >
            <div className="p-3 bg-purple-100 rounded-2xl whitespace-nowrap">
              <Users2 size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="font-black text-lg leading-tight whitespace-nowrap">Volunteers</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Manage Apps</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
