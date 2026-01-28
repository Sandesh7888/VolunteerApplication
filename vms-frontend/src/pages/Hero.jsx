import { Link } from 'react-router-dom';
import { Users, Calendar, Building, Clock, ArrowRight, Heart, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import heroBg from '../assets/home_hero.png';

const stats = [
  { number: '12K+', label: 'Active Volunteers', icon: Users, color: 'text-blue-400' },
  { number: '750+', label: 'Live Events', icon: Calendar, color: 'text-emerald-400' },
  { number: '320+', label: 'Partners', icon: Building, color: 'text-indigo-400' },
  { number: '75K+', label: 'Service Hours', icon: Clock, color: 'text-rose-400' }
];

export const Hero = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
      
      {/* 1. MINIMALIST ANIMATED BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
        
        {/* Very Subtle Animated Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="max-w-2xl text-center lg:text-left">
          

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-6 leading-[0.85] tracking-tighter">
              DRIVE <span className="text-emerald-500">CHANGE.</span> <br />
              BE THE <span className="relative">
                <span className="relative z-10">SPARK.</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-emerald-500/10 -rotate-1 z-0" />
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl font-bold">
              Join a global network of volunteers making tangible impact. Connect, collaborate, and create the future you want to see.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/events"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 uppercase text-xs tracking-widest"
              >
                Find Opportunities
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white hover:bg-slate-50 text-slate-900 font-black rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 uppercase text-xs tracking-widest"
              >
                Join Now <Zap size={16} className="text-amber-500" />
              </Link>
            </div>
          </div>

          {/* Premium Stats Visualization */}
          <div className="relative scale-90 lg:scale-100">
             <div className="grid grid-cols-2 gap-4 relative z-10">
                {stats.map((stat, index) => (
                  <div 
                    key={stat.label} 
                    className={`p-8 bg-white backdrop-blur-3xl rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-emerald-500/20 transition-all duration-500 hover:-translate-y-2 group ${index % 2 !== 0 ? 'lg:translate-y-12' : ''}`}
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
                      <stat.icon size={24} className={stat.color} />
                    </div>
                    <div className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">{stat.number}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Social Proof Footer (Minimalist) */}
      <div className="absolute bottom-0 left-0 right-0 py-8 bg-slate-50/50 backdrop-blur-md border-t border-slate-100 z-20">
         <div className="max-w-7xl mx-auto px-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-700">
               {['GreenPeace', 'UNESCO', 'RedCross', 'UNICEF', 'WHO'].map(brand => (
                 <span key={brand} className="text-sm font-black text-slate-900 tracking-tighter uppercase">{brand}</span>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
