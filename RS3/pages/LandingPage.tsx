import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, MapPin, Truck } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {/* FIRST PAGE LOGO (Replaced Successfully) */}
          <UtensilsCrossed className="text-primary-600 h-8 w-8" />
          <span className="text-2xl font-bold font-serif text-slate-900">ReServe</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/login')}
            className="text-slate-900 font-medium px-4 py-2 hover:text-primary-600 transition text-lg"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-medium transition shadow-lg shadow-primary-200 text-lg"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-8 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-bold text-slate-900 leading-tight font-serif">
              Turn Surplus <br />
              <span className="text-primary-600">Into Support</span>
            </h1>

            <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
              AI-powered platform connecting restaurants and hotels with NGOs to redistribute fresh food.
              Every meal saved is a life touched.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/register')}
                className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-5 rounded-full font-bold text-xl flex items-center gap-3 shadow-xl shadow-primary-100 transition transform hover:-translate-y-1"
              >
                <UtensilsCrossed size={24} />
                Donate Food
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-slate-100 rounded-[3rem] overflow-hidden shadow-2xl relative z-10">
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Delicious Food"
                className="w-full h-[600px] object-cover"
              />
            </div>

            {/* Decorative blob */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 -z-10"></div>
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Reserve</span>
          </div>

          <div className="flex gap-4">
            {/* Empty footer links */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
