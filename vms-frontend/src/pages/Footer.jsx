import { Link } from 'react-router-dom';
import { Facebook, Twitter, Users, Calendar, Building2, Mail, Phone, MapPin, ArrowRight, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 pt-24 pb-12 relative overflow-hidden border-t border-slate-100">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-2xl group-hover:bg-emerald-500 transition-all duration-500">
                <Users className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors">
                Volunteer<span className="text-emerald-500 group-hover:text-slate-900 transition-colors">Hub</span>
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed text-lg font-medium max-w-sm">
              Empowering communities through meaningful connections. Discover opportunities that spark your passion and drive real change.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition-all shadow-sm hover:shadow-xl border border-slate-100 hover:border-slate-900 group">
                  <Icon size={20} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Nav */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Platform</h4>
              <ul className="space-y-4">
                {['Events', 'Volunteers', 'Organizations', 'How it Works'].map((item) => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-slate-600 hover:text-emerald-600 text-sm font-bold transition-all flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Impact', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-600 hover:text-indigo-600 text-sm font-bold transition-all flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Stay Inspired</h4>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700 opacity-50" />
               <p className="text-slate-500 text-xs font-bold mb-4 relative z-10 leading-relaxed">
                 Get impact stories and opportunity alerts delivered to your inbox.
               </p>
               <div className="space-y-3 relative z-10">
                 <input 
                   type="email" 
                   placeholder="you@email.com" 
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                 />
                 <button className="w-full bg-slate-900 border border-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:border-emerald-500 transition-all shadow-xl shadow-slate-100 hover:shadow-emerald-100 active:scale-95">
                   Subscribe
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-slate-400 text-xs font-bold tracking-tight">
              © 2026 VolunteerHub. Built with <Heart size={10} className="inline text-rose-500 fill-rose-500" /> for community development.
            </p>
          </div>
          <div className="flex items-center gap-8">
            {['Privacy', 'Terms', 'Cookies'].map(legal => (
              <a key={legal} href="#" className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
                {legal}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
