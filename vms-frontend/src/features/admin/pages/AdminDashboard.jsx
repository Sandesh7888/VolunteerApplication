import React, { useState, useEffect } from 'react';
import { useApi } from '../../../useApi';
import { LayoutDashboard, Calendar, Users, Briefcase, Clock, ChevronRight, AlertCircle, Loader2, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const AdminDashboard = () => {
  const { apiCall } = useApi();
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, eventsData] = await Promise.all([
        apiCall('/admin/dashboard/stats'),
        apiCall('/admin/events')
      ]);

      setStats(statsData);
      setRecentEvents((eventsData || []).slice(0, 5));

      // Process Chart Data
      const categoryCounts = (eventsData || []).reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {});
      
      const chartArr = Object.keys(categoryCounts).map(cat => ({
        name: cat,
        count: categoryCounts[cat]
      }));
      setChartData(chartArr);

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin w-12 h-12 text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 inline-block">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Events', value: stats?.totalEvents || 0, icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
    { label: 'Organizers', value: stats?.totalOrganizers || 0, icon: Briefcase, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
    { label: 'Volunteers', value: stats?.totalVolunteers || 0, icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-100' },
    { label: 'Pending Apps', value: stats?.pendingApprovals || 0, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100', href: '/admin/events-approval' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-indigo-600" />
            Admin <span className="text-indigo-600">Portal</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg italic tracking-tight">System overview & performance</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border shadow-sm self-start md:self-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-bold text-slate-600 tracking-tight">Online</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, index) => (
          <div key={index} className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              {card.href && (
                <Link to={card.href} className="text-slate-300 hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
            <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">{card.label}</h3>
            <p className="text-3xl font-black text-slate-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={20} />
            Event Distribution
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

        {/* Quick Stats / Pie Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <PieIcon className="text-indigo-500" size={20} />
            User Mix
          </h3>
          <div className="h-[250px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Organizers', value: stats?.totalOrganizers || 0 },
                    { name: 'Volunteers', value: stats?.totalVolunteers || 0 }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-bold"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> Organizers</span>
                <span className="font-black text-slate-900">{stats?.totalOrganizers || 0}</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-500 font-bold"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Volunteers</span>
                <span className="font-black text-slate-900">{stats?.totalVolunteers || 0}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events List */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Recent Registrations</h3>
            <Link to="/admin/events" className="text-indigo-600 hover:text-indigo-700 font-bold text-xs uppercase tracking-widest flex items-center gap-1 group">
              View All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentEvents.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">No recent events recorded</p>
              </div>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date TBD'} • {event.category}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    event.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                    event.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {event.status === 'PUBLISHED' ? 'Approved' : 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 rounded-3xl shadow-xl shadow-indigo-100 text-white">
            <h3 className="text-xl font-bold mb-6">System Controls</h3>
            <div className="space-y-3">
              {[
                { label: 'Manage Events', href: '/admin/events' },
                { label: 'Approval Queue', href: '/admin/events-approval', count: stats?.pendingApprovals },
                { label: 'User Directory', href: '/admin/volunteers' }
              ].map((action, i) => (
                <Link key={i} to={action.href} className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 backdrop-blur-md transition-all group">
                  <span className="font-bold text-sm">{action.label}</span>
                  <div className="flex items-center gap-2">
                    {action.count > 0 && (
                      <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-white/20">
                        {action.count}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Clock className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Awaiting Review</p>
              <p className="text-2xl font-black text-slate-900">{stats?.pendingApprovals || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
