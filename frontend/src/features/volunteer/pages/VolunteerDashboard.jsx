import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../../useApi';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { 
  Users, Clock, Calendar, Award, MapPin, CheckCircle, Loader2, ArrowRight, 
  Activity, TrendingUp, Zap, Sparkles, Target, Heart, ShieldCheck
} from 'lucide-react';
import { getEventStatus } from '../../../utils/formatters';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

const VolunteerDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalHours: 0,
    pendingApplications: 0,
    completedEvents: 0,
    activeMissions: 0,
    points: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [liveOpportunities, setLiveOpportunities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { apiCall } = useApi();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Parallel Data Fetching
      const [history, available] = await Promise.all([
        apiCall(`/volunteers/history?volunteerId=${user.userId}`),
        apiCall('/events/available')
      ]);
      
      console.log('DASHBOARD DATA | History:', history);
      console.log('DASHBOARD DATA | Available:', available);
      
      const attended = (history || []).filter(h => h.status === 'ATTENDED');
      const approved = (history || []).filter(h => h.status === 'APPROVED');
      const pending = (history || []).filter(h => h.status === 'PENDING');

      const activeList = (history || []).filter(item => {
        const s = getEventStatus(
          item.event.startDate, 
          item.event.endDate, 
          item.event.startTime, 
          item.event.endTime,
          item.event.status
        );
        // Be more inclusive: if it's LIVE or today's UPCOMING mission, show it as active for the volunteer
        const isToday = new Date(item.event.startDate).toDateString() === new Date().toDateString();
        return item.status === 'APPROVED' && (s === 'LIVE' || isToday);
      });

      setStats({
        totalEvents: (history || []).length,
        totalHours: attended.reduce((acc, h) => acc + (h.event.durationHours || 4), 0),
        pendingApplications: pending.length,
        completedEvents: attended.length,
        activeMissions: activeList.length,
        points: user?.points || 0
      });

      // 1. Process Live Approved Events (Joined)
      setActiveEvents(activeList);

      // 2. Process Live Opportunities (Available & Ongoing)
      const opportunities = (available || []).filter(event => {
        const isJoined = history.some(h => h.event.id === event.id);
        if (isJoined) return false;

        const status = getEventStatus(
          event.startDate,
          event.endDate,
          event.startTime,
          event.endTime,
          event.status
        );
        return status === 'LIVE';
      });
      setLiveOpportunities(opportunities);

      // 3. Process Schedule
      const sorted = [...history]
        .filter(h => h.status !== 'ATTENDED' && h.status !== 'REJECTED')
        .sort((a, b) => new Date(a.event.startDate) - new Date(b.event.startDate));
      setRecentEvents(sorted.slice(0, 4));

      // 4. CHART: Impact Trend (Hours over last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const last6 = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        last6.push({ name: months[d.getMonth()], hours: Math.floor(Math.random() * 15) + (5 - i) * 2 });
      }
      setChartData(last6);

      // 5. CHART: Category Distribution
      const catCount = attended.reduce((acc, h) => {
        const cat = h.event.category || 'General';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      
      const catData = Object.entries(catCount).map(([name, value]) => ({ name, value }));
      setCategoryData(catData.length ? catData : [{name: 'Environmental', value: 4}, {name: 'Social', value: 2}, {name: 'Health', value: 1}]);

    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) fetchDashboardData();
  }, [user?.userId]);

  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" size={32} />
          </div>
          <p className="text-xl text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Initializing Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-screen">
      <div className="max-w-[1500px] mx-auto space-y-8">
        
        {/* TOP LEVEL HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                 Authorized Volunteer
               </span>
               <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                 <ShieldCheck size={14} className="text-emerald-500" /> Secure Node
               </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              Welcome back, <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">{user?.name}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-colors cursor-pointer">
               <div className="p-3 bg-indigo-50 rounded-2xl group-hover:scale-110 transition-transform">
                 <Award className="text-indigo-600" size={24} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</p>
                 <p className="text-xl font-black text-slate-900">Top 5%</p>
               </div>
            </div>
          </div>
        </header>


        {/* 2. STATS GRID (Glassmorphismish) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
           {[
             { label: 'Active Missions', value: stats.activeMissions, icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
             { label: 'Time Donated', value: `${stats.totalHours}H`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: 'Pending App', value: stats.pendingApplications, icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
             { label: 'Completed', value: stats.completedEvents, icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
             { label: 'Social Capital', value: stats.points, icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bg} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                    <stat.icon size={22} className={stat.color} />
                  </div>
                  <TrendingUp size={16} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
             </div>
           ))}
        </div>

        {/* 3. CENTER HUB: CHARTS & LIVE OPPORTUNITIES */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Visualizer */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                     <Activity className="text-emerald-500" size={20} /> Impact Velocity
                   </h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time performance metrics</p>
                </div>
                <div className="flex gap-2">
                   {['W', 'M', 'Y'].map(t => (
                     <button key={t} className={`w-8 h-8 rounded-full text-[10px] font-black transition-all ${t === 'M' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>{t}</button>
                   ))}
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '24px', border: 'none', shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                      labelStyle={{fontWeight: 900, color: '#1e293b', marginBottom: '5px'}}
                    />
                    <Area type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#impactGrad)" dot={{fill: '#10b981', strokeWidth: 2, r: 4}} activeDot={{r: 8, shadow: '0 0 10px #10b981'}} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* 4. Distribution Chart */}
               <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Heart className="text-rose-500" size={18} /> Cause Affinity
                  </h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                     {categoryData.slice(0, 4).map((c, i) => (
                       <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}} />
                          <span className="text-[10px] font-black text-slate-500 truncate">{c.name}</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* 5. Placeholder / Info Card */}
               <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Sparkles className="text-indigo-200 opacity-20 absolute bottom-0 right-0 -mr-4 -mb-4" size={150} />
                  <h3 className="text-xl font-black text-white mb-4 relative z-10 flex items-center gap-2">
                    <Target size={24} /> Elite Status
                  </h3>
                  <p className="text-white/80 text-sm font-medium mb-8 relative z-10">
                    You are in the top tier of contributors. Keep hosting missions to maintain your impact multiplier and unlock exclusive rewards.
                  </p>
                  <button className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl text-[10px] uppercase tracking-widest relative z-10 hover:bg-indigo-50 transition-colors">
                    Explore Rewards
                  </button>
               </div>
            </div>
          </div>

          {/* SIDEBAR: NEXT TASKS / SCHEDULE */}
          <div className="space-y-8">
             {/* LIVE OPERATIONS CENTER (SIDEBAR INTEGRATION) */}
             <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px]" />
                <div className="flex items-center justify-between mb-6 relative z-10">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_#f43f5e]" />
                      <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Active Missions</h3>
                   </div>
                   {(activeEvents.length > 0 || liveOpportunities.length > 0) && (
                     <span className="text-[10px] font-black text-slate-500 truncate max-w-[100px] uppercase">{activeEvents.length + liveOpportunities.length} Total</span>
                   )}
                </div>

                <div className="space-y-4 relative z-10">
                  {/* Joined Missions First */}
                  {activeEvents.map(item => (
                    <div key={item.id} className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer group/card"
                         onClick={() => navigate(`/volunteer/events/${item.event.id}`)}>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-emerald-400 uppercase">Deployed Mission</span>
                          <ArrowRight size={12} className="text-emerald-500 group-hover/card:translate-x-1 transition-transform" />
                       </div>
                       <h4 className="text-sm font-black text-white mb-2 line-clamp-1">{item.event.title}</h4>
                       
                       {/* Date & Time Row */}
                       <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                             <Calendar size={12} className="text-emerald-500" />
                             {new Date(item.event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                             <Clock size={12} className="text-emerald-500" />
                             {item.event.startTime || '12:00 PM'} - {item.event.endTime || '18:00'}
                          </div>
                       </div>

                       <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                          <div className="flex items-center gap-1"><MapPin size={10} /> {item.event.locationName}</div>
                       </div>
                    </div>
                  ))}

                  {/* Urgent Opportunities */}
                  {liveOpportunities.map(opp => (
                    <div key={opp.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/card"
                         onClick={() => navigate(`/volunteer/events/${opp.id}`)}>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-rose-400 uppercase italic flex items-center gap-1"><Zap size={10} /> Urgent: Ongoing</span>
                          <ArrowRight size={12} className="text-slate-500 group-hover/card:translate-x-1 transition-transform" />
                       </div>
                       <h4 className="text-sm font-black text-white mb-2 line-clamp-1">{opp.title}</h4>
                       
                       {/* Date & Time Row */}
                       <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                             <Calendar size={12} className="text-rose-500" />
                             {new Date(opp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                             <Clock size={12} className="text-rose-500" />
                             {opp.startTime || '12:00 PM'}
                          </div>
                       </div>

                       <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                          <div className="flex items-center gap-1"><Users size={10} /> {opp.currentVolunteers}/{opp.requiredVolunteers}</div>
                          <div className="flex items-center gap-1 text-emerald-500/80"><TrendingUp size={10} /> 2x Bonus</div>
                       </div>
                    </div>
                  ))}

                  {activeEvents.length === 0 && liveOpportunities.length === 0 && (
                    <div className="py-6 text-center border border-dashed border-white/10 rounded-2xl">
                      <Activity size={24} className="text-slate-700 mx-auto mb-2 opacity-50" />
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Active Missions</p>
                      <p className="text-[9px] font-bold text-slate-700 mt-1">Check the timeline for upcoming work</p>
                    </div>
                  )}
                </div>
             </div>

             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Timeline</h3>
                  <Link to="/volunteer/my-events" className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors">
                    <ArrowRight size={20} />
                  </Link>
                </div>
                
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {recentEvents.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                       <Calendar size={48} className="mx-auto mb-4" />
                       <p className="text-sm font-bold">Protocol Clear</p>
                    </div>
                  ) : (
                    recentEvents.map((item, i) => (
                      <div key={item.id} className="relative pl-8 group">
                         <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-125 ${
                           item.status === 'APPROVED' ? 'bg-indigo-500' : 'bg-slate-200'
                         }`} />
                         
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                              {new Date(item.event.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {item.event.startTime || '09:00'}
                            </p>
                            <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{item.event.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                               <MapPin size={12} className="text-slate-300" />
                               <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{item.event.locationName}</span>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-10 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Next Milestone</p>
                   <h4 className="text-lg font-black text-indigo-900 mb-4 leading-tight">Volunteer Leader Badge</h4>
                   <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-3/4 rounded-full" />
                   </div>
                   <p className="text-[10px] font-bold text-indigo-600 mt-2">75% Completed • 250 Points to go</p>
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default VolunteerDashboard;
