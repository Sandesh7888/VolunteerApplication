import { Link } from 'react-router-dom';
import { Users, Calendar, Building, Clock, ArrowRight, Heart, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import heroBg from '../assets/home_hero.png';


export const Hero = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      
      {/* 1. IMMERSIVE BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Campaign Hero" 
          className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-60"
        />
        {/* Advanced Multi-layered Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.15),transparent_50%)] z-10" />
        <div className="absolute inset-0 bg-slate-950/30 z-10" />
        
        {/* Dynamic Animated Blobs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-blob z-20" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000 z-20" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-30 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Content Area */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] mb-8 animate-fade-in">
              <Sparkles size={14} /> Join the Global Movement
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 leading-[0.8] tracking-tighter">
              DRIVE <br />
              <span className="text-gradient">CHANGE.</span> <br />
              <span className="relative inline-block mt-4">
                BE THE SPARK.
                <div className="absolute -bottom-2 left-0 w-full h-4 bg-emerald-500/20 -rotate-1 blur-sm" />
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-xl font-medium">
              Empowering individuals to build a better future through <span className="text-white font-bold italic underline decoration-emerald-500/50 decoration-4">purpose-driven</span> volunteering.
            </p>

           
          </div>         
        </div>
      </div>
    </div>
  );
};
