
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, ArrowLeft } from 'lucide-react';
import { UserRole } from '../../types';

const RecipientLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user && user.role === UserRole.RECIPIENT) {
      navigate('/recipient');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = login(email, password);
    if (result === true) {
      // Navigation happens in useEffect
      navigate('/recipient');
    } else if (typeof result === 'string') {
      setError(result);
    } else {
      setError('Incorrect username or password. Please try again.');
    }
  };

  const fillDemoCreds = () => {
    setEmail('home1@reserve.com');
    setPassword('1234');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100 relative">
        
        <Link 
          to="/login"
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition"
          title="Back to Selection"
        >
          <ArrowLeft size={24} />
        </Link>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
             <Home className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-serif">Orphanage Login</h1>
          <p className="text-slate-500">Access your home dashboard.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email / Username</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-slate-50 focus:bg-white"
              placeholder="home@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-slate-50 focus:bg-white"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary-200 hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
           <button type="button" className="text-slate-500 hover:text-primary-600 font-medium transition">Forgot Password?</button>
           <Link to="/recipient-register" className="text-primary-600 font-bold hover:underline">Register New Home</Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-50">
           <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider mb-3">Quick Demo</p>
           <div className="flex justify-center">
             <button type="button" className="bg-slate-100 hover:bg-primary-50 text-slate-600 hover:text-primary-700 px-4 py-2 rounded-lg transition text-xs font-bold" onClick={fillDemoCreds}>
               Orphanage (Home 1)
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientLogin;
