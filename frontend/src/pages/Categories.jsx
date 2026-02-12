import { HeartPulse, BookOpen, Leaf, Trash2, Users, PawPrint } from 'lucide-react';

const categories = [
  { name: "Health", icon: HeartPulse, color: "from-rose-500 to-pink-600", shadow: "shadow-rose-500/40" },
  { name: "Education", icon: BookOpen, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/40" },
  { name: "Environment", icon: Leaf, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/40" },
  { name: "Cleanup", icon: Trash2, color: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/40" },
  { name: "Social Welfare", icon: Users, color: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/40" },
  { name: "Animal Care", icon: PawPrint, color: "from-pink-500 to-fuchsia-600", shadow: "shadow-pink-500/40" }
];

const Categories = () => {
  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Explore Categories
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-3xl mx-auto">
            Find opportunities that match your passion and skills
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {categories.map((cat, i) => (
            <div key={i} className="group cursor-pointer perspective">
              <div className="relative h-full bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-slate-200 hover:-translate-y-2 overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.color} opacity-10 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform duration-500`} />
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-6 shadow-lg ${cat.shadow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <cat.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-700 transition-colors">
                  {cat.name}
                </h3>
                
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-wider">
                  <span>View Events</span>
                  <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
