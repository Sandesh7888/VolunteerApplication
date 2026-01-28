import { Cross, Globe, Baby, Users, Package, Home, Users2 } from 'lucide-react';
import heroBg from '../assets/hero_partners.png';

const partners = [
  { name: "Red Cross", icon: Cross, color: "from-rose-600 to-red-700" },
  { name: "GreenPeace", icon: Globe, color: "from-emerald-600 to-teal-700" },
  { name: "UNICEF", icon: Baby, color: "from-blue-600 to-indigo-700" },
  { name: "Save the Children", icon: Users, color: "from-orange-600 to-amber-700" },
  { name: "Food Bank", icon: Package, color: "from-yellow-600 to-orange-700" },
  { name: "Habitat", icon: Home, color: "from-indigo-600 to-violet-700" },
  { name: "Rotary", icon: Users2, color: "from-violet-600 to-purple-700" }
];

const Partners = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Partners Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Trusted By <span className="text-emerald-400">World Leaders</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 font-medium mb-8 leading-relaxed">
              Join <span className="text-emerald-400 font-bold">320+</span> leading organizations already leveraging VolunteerHub to drive meaningful social impact across the globe.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25">
                Become a Partner
              </button>
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-md border border-white/20">
                View Case Studies
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Grid Section */}
      <section className="py-24 relative -mt-20 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
            {partners.map((partner, i) => (
              <div 
                key={i} 
                className="group relative"
              >
                <div className="relative p-8 rounded-2xl bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hoverShadow-emerald-100/50 hover:-translate-y-2 transition-all duration-500 border border-slate-100 overflow-hidden">
                  {/* Hover Background Accent */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 ${partner.color} bg-gradient-to-br`} />
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 ${partner.color} bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-slate-200 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <partner.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Partner name */}
                  <h3 className="text-lg font-bold text-slate-800 text-center group-hover:text-emerald-600 transition-colors duration-300">
                    {partner.name}
                  </h3>
                  
                  {/* Status */}
                  <div className="mt-4 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest whitespace-nowrap">Verified Partner</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Stats Row */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 p-12 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 italic">
            <div className="text-center md:border-r border-slate-100 last:border-0">
              <div className="text-5xl font-black text-slate-900 mb-2">320<span className="text-emerald-500">+</span></div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Global Partners</div>
            </div>
            <div className="text-center md:border-r border-slate-100 last:border-0">
              <div className="text-5xl font-black text-slate-900 mb-2">50<span className="text-emerald-500">+</span></div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Countries</div>
            </div>
            <div className="text-center md:border-r border-slate-100 last:border-0">
              <div className="text-5xl font-black text-slate-900 mb-2">12K<span className="text-emerald-500">+</span></div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Events Processed</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-slate-900 mb-2">99<span className="text-emerald-500">%</span></div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
