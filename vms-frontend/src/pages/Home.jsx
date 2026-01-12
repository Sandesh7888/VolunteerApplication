import { Link } from "react-router-dom";
import bgImage from '../assets/home.png';

function Home() {
  const bgStyle = {
    backgroundImage: `url(${bgImage})`,  
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center" 
      style={bgStyle}
    >
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="text-center relative z-10 bg-white/90 backdrop-blur-sm px-8 py-12 rounded-3xl shadow-2xl max-w-md mx-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Volunteer Hub
        </h1>
        <p className="text-xl text-gray-700 mb-10 leading-relaxed">
          Welcome to the volunteering platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
