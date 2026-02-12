import bgImage from '../assets/home_hero.png';
import Nav from './Nav';
import { Hero } from './Hero';
import Categories from './Categories';
import HowItWorks from './HowItWorks';
import Partners from './Partners';
import Testimonials from './Testimonials';
import { Footer } from './Footer';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const bgStyle = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh'
  };

  return (
    <div className={`min-h-screen bg-slate-50 transition-colors duration-300`}>
      <div className="relative">
        {/* Pass theme state to Nav */}

        <Nav darkMode={darkMode} toggleTheme={toggleTheme} scrolled={scrolled} />
        
        <div className="relative">
          <Hero />
          
          <div className="pb-0 bg-white">
            <Categories />
            <HowItWorks /> 
            <Partners />
            <Testimonials />
            <Footer />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          /* Light Green Scrollbar Theme */
          *::-webkit-scrollbar { 
            width: 6px; 
            height: 6px; 
          }
          
          *::-webkit-scrollbar-track { 
            background: rgba(132, 204, 22, 0.1); /* Light lime green */
          }
          
          *::-webkit-scrollbar-thumb { 
            background: rgba(16, 185, 129, 0.7); /* Emerald green */
            border-radius: 3px; 
          }
          
          *::-webkit-scrollbar-thumb:hover { 
            background: rgba(34, 197, 94, 0.9); /* Brighter green */
          }
          
          /* Firefox */
          * { 
            scrollbar-width: thin; 
            scrollbar-color: rgba(16, 185, 129, 0.7) rgba(132, 204, 22, 0.1); 
          }
          
          /* Dark mode green scrollbars */
          .dark *::-webkit-scrollbar-track { 
            background: rgba(77, 210, 77, 0.2); 
          }
          .dark *::-webkit-scrollbar-thumb { 
            background: rgba(34, 197, 94, 0.8); 
          }
        `
      }} />
    </div>
  );
}

export default Home;
