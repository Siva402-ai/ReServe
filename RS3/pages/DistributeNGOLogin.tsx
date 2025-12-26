
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const DistributeNGOLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
        // Assuming distribute login uses NGO role primarily
        navigate('/ngo/distribute');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = login(email, password);
    if (result === true) {
       // Navigation happens via useEffect or defaults to ngo distribute
       navigate('/ngo/distribute');
    } else if (typeof result === 'string') {
       setError(result);
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
             <UtensilsCrossed className="text-white" size={24} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 font-serif">Distribute Login</h1>
          <p className="text-slate-500">Sign in to manage food distribution.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition bg-slate-50 focus:bg-white"
              placeholder="distributor@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Enter Password</label>
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

        <div className="mt-8 text-center text-sm text-slate-600">
          New to ReServe?{' '}
          <Link to="/distribute-ngosignup" className="text-primary-600 hover:text-primary-700 font-bold hover:underline">
            Register Partner
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DistributeNGOLogin;
