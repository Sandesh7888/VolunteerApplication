import { Users, Star, Quote, Sparkles } from 'lucide-react';

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Volunteer Coordinator",
    content: "VolunteerHub transformed how we organize community events. The platform is intuitive and has helped us engage 3x more volunteers!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Rahul Patel",
    role: "Senior Volunteer",
    content: "Found my passion for teaching through this platform. The matching system is spot-on and events are always meaningful.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "NGO Mumbai",
    role: "Organization Lead",
    content: "Streamlined our volunteer management completely. Real-time tracking and communication features are game-changers.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop&crop=face"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Soft Background Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6">
            <Users size={14} />
            Community Voices
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-8 text-slate-900 tracking-tighter leading-tight">
            Real Stories from <br />
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Global Community</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Join thousands of volunteers who've found their purpose, built lifelong connections, and created real impact.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <article 
              key={index} 
              className="group relative bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-3"
            >
              {/* Quote Ornament */}
              <div className="absolute -top-6 left-10 w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-slate-200 group-hover:bg-emerald-500 group-hover:shadow-emerald-100 transition-all duration-500">
                <Quote className="w-6 h-6" />
              </div>
              
              <div className="pt-8">
                {/* Rating */}
                <div className="flex mb-8 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-slate-600 text-xl leading-relaxed mb-10 font-bold italic tracking-tight">
                  "{testimonial.content}"
                </blockquote>
                
                {/* Author Info */}
                <div className="flex items-center gap-5 pt-8 border-t border-slate-50">
                  <div className="relative">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 shadow-sm"
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                      <Sparkles size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {testimonial.name}
                    </h4>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
