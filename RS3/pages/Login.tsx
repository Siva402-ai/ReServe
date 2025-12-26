
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { UtensilsCrossed, HeartHandshake, Truck, Home, ShieldCheck, ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  
  // State to track if a role has been selected from the grid
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === UserRole.DONOR) navigate('/donor');
      else if (user.role === UserRole.NGO) navigate('/ngo');
      else if (user.role === UserRole.ADMIN) navigate('/admin');
      else if (user.role === UserRole.RECIPIENT) navigate('/recipient');
    }
  }, [user, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    if (role === UserRole.RECIPIENT) {
      // Navigate to the separate Recipient/Orphanage login page
      navigate('/recipient-login');
    } else {
      // Set state to show the form for Donor/NGO/Admin
      setSelectedRole(role);
      setError('');
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = login(email, password);
    if (result === true) {
      // Navigation happens in useEffect
    } else if (typeof result === 'string') {
        setError(result);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const fillDemoCreds = () => {
    if (selectedRole === UserRole.DONOR) setEmail('donor@reserve.com');
    if (selectedRole === UserRole.NGO) setEmail('ngo@reserve.com');
    if (selectedRole === UserRole.ADMIN) setEmail('admin@reserve.com');
    setPassword('reserve123');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.NGO: return <Truck size={32} />;
      case UserRole.DONOR: return <UtensilsCrossed size={32} />;
      case UserRole.RECIPIENT: return <Home size={32} />;
      case UserRole.ADMIN: return <ShieldCheck size={32} />;
      default: return <UtensilsCrossed size={32} />;
    }
  };

  const getRoleLabel = () => {
    if (selectedRole === UserRole.NGO) return "NGO / Charity";
    if (selectedRole === UserRole.DONOR) return "Food Donor";
    if (selectedRole === UserRole.ADMIN) return "Administrator";
    return "Login";
  };

  // --- VIEW 1: ROLE SELECTION GRID ---
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <UtensilsCrossed className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 font-serif">ReServe</h1>
          </div>
          <p className="text-slate-500 text-lg">Who are you logging in as?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full px-4 animate-fade-in">
          
          {/* 1. NGO BOX */}
          <button 
            onClick={() => handleRoleSelect(UserRole.NGO)}
            className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 hover:border-emerald-200 transition-all duration-300 flex flex-col items-center text-center gap-4 hover:-translate-y-1"
          >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Truck size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition">NGO Partner</h3>
              <p className="text-slate-500 text-sm mt-2">Find food and manage distributions.</p>
            </div>
          </button>

          {/* 2. DONOR BOX */}
          <button 
            onClick={() => handleRoleSelect(UserRole.DONOR)}
            className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center gap-4 hover:-translate-y-1"
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300">
              <HeartHandshake size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition">Food Donor</h3>
              <p className="text-slate-500 text-sm mt-2">Donate surplus food from your business.</p>
            </div>
          </button>

          {/* 3. ORPHANAGE BOX */}
          <button 
            onClick={() => handleRoleSelect(UserRole.RECIPIENT)}
            className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 hover:border-pink-200 transition-all duration-300 flex flex-col items-center text-center gap-4 hover:-translate-y-1"
          >
            <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Home size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-pink-700 transition">Orphanage / Home</h3>
              <p className="text-slate-500 text-sm mt-2">Access dashboard and update needs.</p>
            </div>
          </button>

          {/* 4. ADMIN BOX */}
          <button 
            onClick={() => handleRoleSelect(UserRole.ADMIN)}
            className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 hover:border-purple-200 transition-all duration-300 flex flex-col items-center text-center gap-4 hover:-translate-y-1"
          >
            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-purple-700 transition">Platform Admin</h3>
              <p className="text-slate-500 text-sm mt-2">Manage users and verify accounts.</p>
            </div>
          </button>

        </div>
        
        <div className="mt-12 text-slate-400 text-sm">
          Return to <Link to="/" className="text-primary-600 font-bold hover:underline">Home Page</Link>
        </div>
      </div>
    );
  }

  // --- VIEW 2: LOGIN FORM (Specific Role) ---
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md border border-slate-100 relative animate-fade-in">
        
        <button 
          onClick={() => setSelectedRole(null)}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition"
          title="Back to Selection"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="text-center mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg 
            ${selectedRole === UserRole.NGO ? 'bg-emerald-600 shadow-emerald-200' : 
              selectedRole === UserRole.DONOR ? 'bg-blue-600 shadow-blue-200' : 
              'bg-purple-600 shadow-purple-200'}`}>
             <div className="text-white">
               {getRoleIcon(selectedRole)}
             </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-serif">{getRoleLabel()}</h1>
          <p className="text-slate-500">Sign in to continue.</p>
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
              placeholder="you@example.com"
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

        <div className="mt-8 text-center text-sm text-slate-600">
          New to ReServe?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold hover:underline">
            Create Account
          </Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-50">
           <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider mb-3">Quick Demo Login</p>
           <div className="flex justify-center">
             <button 
                type="button" 
                className="bg-slate-100 hover:bg-primary-50 text-slate-600 hover:text-primary-700 px-6 py-2 rounded-lg transition font-bold text-sm" 
                onClick={fillDemoCreds}
             >
                Use Demo Credentials
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
