/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useApi } from "../../../useApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, Calendar, Ticket, Award, Loader2 } from 'lucide-react';

const AdminReports = () => {
  const { apiCall } = useApi();
  const [stats, setStats] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes] = await Promise.all([
        apiCall('/reports/dashboard-stats'),
        apiCall('/reports/charts-data')
      ]);
      setStats(statsRes);
      setChartsData(chartsRes);
    } catch (error) {
      console.error("Error fetching reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Transform data for Recharts
  const userRoleData = chartsData?.userRoles ? Object.entries(chartsData.userRoles).map(([name, value]) => ({ name, value })) : [];
  const eventStatusData = chartsData?.eventStatus ? Object.entries(chartsData.eventStatus).map(([name, value]) => ({ name, value })) : [];
  const ticketStatusData = chartsData?.ticketStatus ? Object.entries(chartsData.ticketStatus).map(([name, value]) => ({ name, value })) : [];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800">Admin Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers} icon={<Users className="text-blue-500" />} color="bg-blue-50 border-blue-100" />
        <StatCard title="Total Events" value={stats?.totalEvents} icon={<Calendar className="text-green-500" />} color="bg-green-50 border-green-100" />
        <StatCard title="Support Tickets" value={stats?.totalTickets} icon={<Ticket className="text-purple-500" />} color="bg-purple-50 border-purple-100" />
        <StatCard title="Organizers" value={stats?.totalOrganizers} icon={<Award className="text-amber-500" />} color="bg-amber-50 border-amber-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Chart */}
        <ChartCard title="User Distribution by Role">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Event Status Chart */}
        <ChartCard title="Event Status Overview">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

         {/* Ticket Status Chart */}
         <ChartCard title="Support Ticket Status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {ticketStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`p-6 rounded-2xl border ${color} shadow-sm flex items-center justify-between`}>
    <div>
      <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-black text-slate-800 mt-2">{value}</p>
    </div>
    <div className="p-4 bg-white rounded-xl shadow-sm">
      {icon}
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <h3 className="text-lg font-bold text-slate-800 mb-6">{title}</h3>
    <div className="w-full">
      {children}
    </div>
  </div>
);

export default AdminReports;