import { UserPlus, MapPin, Handshake, ArrowRight } from 'lucide-react';

const howItWorks = [
  {
    title: "Create Account",
    description: "Sign up as volunteer or organization in just 2 minutes.",
    icon: UserPlus,
    color: "from-emerald-500 to-teal-600",
    number: "01"
  },
  {
    title: "Find Events", 
    description: "Discover events near you based on skills and interests.",
    icon: MapPin,
    color: "from-blue-500 to-indigo-600",
    number: "02"
  },
  {
    title: "Join & Impact",
    description: "Register, participate, and make a real difference.",
    icon: Handshake,
    color: "from-purple-500 to-violet-600",
    number: "03"
  }
];

const HowItWorks = () => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-emerald-50 py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5" />
      
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-emerald-800 via-gray-900 to-teal-800 bg-clip-text text-transparent drop-shadow-2xl">
          How It Works
        </h2>
        <p className="text-xl md:text-2xl text-gray-700 font-medium mb-20 max-w-3xl mx-auto leading-relaxed">
          Get started in <span className="font-bold text-emerald-600">3 simple steps</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {howItWorks.map((step, index) => (
            <div key={index} className="group relative">
              {/* Step number background */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-4 border-white flex items-center justify-center z-20">
                <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {step.number}
                </span>
              </div>
              
              {/* Main card */}
              <div className={`relative p-10 rounded-3xl shadow-2xl hover:shadow-3xl border border-white/50 hover:border-emerald-200/60 transition-all duration-700 hover:-translate-y-6 group-hover:scale-[1.02] overflow-hidden bg-white/90 backdrop-blur-xl ${step.color}`}>
                {/* Gradient overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${step.color}" />
                
                {/* Icon */}
                <div className={`w-24 h-24 ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-4 border-white/20`}>
                  <step.icon className="w-14 h-14 text-white drop-shadow-lg" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 group-hover:text-emerald-900 transition-colors duration-300 drop-shadow-lg">
                  {step.title}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed font-medium max-w-sm mx-auto">
                  {step.description}
                </p>
                
                {/* Arrow indicator */}
                <div className="mt-8 pt-6 border-t-2 border-emerald-100">
                  <ArrowRight className="w-7 h-7 text-emerald-500 mx-auto group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
