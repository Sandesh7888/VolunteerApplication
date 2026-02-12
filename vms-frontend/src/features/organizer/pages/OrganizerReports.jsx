import React, { useEffect, useState } from 'react';
import { useApi } from "../../../useApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Loader2, Users, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

const OrganizerReports = () => {
    const { apiCall } = useApi();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.userId) {
            fetchStats();
        }
    }, [user?.userId]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`/reports/organizer-stats?organizerId=${user.userId}`);
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600 w-12 h-12" /></div>;
    if (error) return <div className="text-red-500 p-8 text-center bg-red-50 rounded-xl border border-red-200 m-8">Error loading reports: {error}</div>;

    // Transform Data for Charts
    const eventStatusData = stats?.eventStatus 
      ? Object.entries(stats.eventStatus).map(([key, value]) => ({ name: key, value }))
      : [];

    const volunteerStatsData = [
      { name: 'Pending', value: stats?.pendingRequests || 0, color: '#f97316' },
      { name: 'Approved', value: stats?.approvedVolunteers || 0, color: '#22c55e' }
    ];

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

    return (
        <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Organizer Insights</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time performance metrics</p>
                </div>
                <button 
                  onClick={fetchStats}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold shadow-sm transition-all"
                >
                    Diff Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                  title="Total Events" 
                  value={stats?.totalEvents} 
                  icon={<Calendar className="text-blue-500" />} 
                  bg="bg-blue-50" 
                  border="border-blue-100"
                />
                <StatsCard 
                  title="Total Volunteers" 
                  value={stats?.totalVolunteers} 
                  icon={<Users className="text-indigo-500" />} 
                  bg="bg-indigo-50" 
                  border="border-indigo-100"
                />
                <StatsCard 
                  title="Pending Requests" 
                  value={stats?.pendingRequests} 
                  icon={<AlertCircle className="text-orange-500" />} 
                  bg="bg-orange-50" 
                  border="border-orange-100"
                />
                 <StatsCard 
                  title="Active/Approved" 
                  value={stats?.approvedVolunteers} 
                  icon={<TrendingUp className="text-green-500" />} 
                  bg="bg-green-50" 
                  border="border-green-100"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Event Status Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 pl-2 border-l-4 border-indigo-500">Event Status Distribution</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={eventStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {eventStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Volunteer Recruitment Chart */}
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 pl-2 border-l-4 border-green-500">Volunteer Application Status</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volunteerStatsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#F1F5F9'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                  {volunteerStatsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatsCard = ({ title, value, icon, bg, border }) => (
    <div className={`p-6 rounded-3xl border ${border} ${bg} shadow-sm transition-transform hover:-translate-y-1`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs">{title}</h3>
            <div className="p-2 bg-white rounded-xl shadow-sm">
                {icon}
            </div>
        </div>
        <p className="text-4xl font-black text-slate-800">{value}</p>
    </div>
);

export default OrganizerReports;