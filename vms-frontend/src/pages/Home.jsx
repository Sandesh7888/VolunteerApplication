import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Volunteer Hub</h1>
        <p className="text-xl text-gray-600 mb-8">Welcome to the volunteering platform</p>
        <div className="space-x-4">
          <a 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
          >
            Login
          </a>
          <a 
            href="/register" 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;