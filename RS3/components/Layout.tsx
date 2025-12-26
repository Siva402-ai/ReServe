
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  LogOut, 
  BarChart3,
  UtensilsCrossed,
  Heart,
  History,
  Settings,
  Users,
  Home
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-primary-50 text-primary-700 font-bold shadow-sm ring-1 ring-primary-200' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'
        }`}
      >
        <Icon size={20} className={`mr-3 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col fixed h-full z-10 shadow-sm">
        <div className="p-8 border-b border-slate-50 flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-primary-200">
             <UtensilsCrossed className="text-white" size={18} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">ReServe</h1>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">
              Main Menu
            </p>
            
            {user.role === UserRole.DONOR && (
              <>
                <NavItem path="/donor" icon={LayoutDashboard} label="Dashboard" />
                <NavItem path="/donor/create" icon={PlusCircle} label="Donate Food" />
                <NavItem path="/donor/history" icon={History} label="Donation History" />
              </>
            )}

            {user.role === UserRole.NGO && (
              <>
                <NavItem path="/ngo" icon={List} label="Find Food" />
                <NavItem path="/ngo/distribute" icon={Heart} label="Distribute Food" />
              </>
            )}

            {user.role === UserRole.RECIPIENT && (
              <>
                <NavItem path="/recipient" icon={Home} label="Dashboard" />
              </>
            )}

            {user.role === UserRole.ADMIN && (
              <>
                <NavItem path="/admin" icon={BarChart3} label="Dashboard" />
                <NavItem path="/admin/users" icon={Users} label="User Management" />
              </>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-50">
           {/* Clickable Profile Section */}
           <button 
             onClick={() => navigate('/profile')}
             className="flex items-center mb-6 w-full text-left p-2 -ml-2 rounded-xl hover:bg-slate-50 transition group"
             title="View Profile"
           >
             <div className="w-10 h-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3 shadow-sm group-hover:scale-105 transition">
               {user.name.charAt(0)}
             </div>
             <div className="overflow-hidden flex-1">
               <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-700 transition">{user.name}</p>
               <p className="text-xs text-slate-500 truncate">{user.role}</p>
             </div>
             <Settings size={14} className="text-slate-300 group-hover:text-primary-400 opacity-0 group-hover:opacity-100 transition" />
           </button>

           <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
           >
             <LogOut size={16} className="mr-3" />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
