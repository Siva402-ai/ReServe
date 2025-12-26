
import React, { useState, useEffect } from 'react';
import { mockDB } from '../../services/mockDatabase';
import { FoodStatus, UserRole, FreshnessLevel, FoodPost, User } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Package, Truck, CheckCircle, Clock, XCircle, Activity, Award } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<FoodPost[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Load Data & Listen for Updates for Real-time stats
  useEffect(() => {
    const loadData = () => {
      setPosts(mockDB.getPosts());
      setUsers(mockDB.getUsers());
    };

    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('reserve_db_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('reserve_db_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // --- USER STATS ---
  const totalDonors = users.filter(u => u.role === UserRole.DONOR).length;
  const totalNgos = users.filter(u => u.role === UserRole.NGO).length;

  // --- DONATION STATS ---
  const totalDonations = posts.length;
  const pending = posts.filter(p => p.status === FoodStatus.AVAILABLE).length;
  const inProgress = posts.filter(p => p.status === FoodStatus.ACCEPTED || p.status === FoodStatus.REACHED).length;
  const completed = posts.filter(p => p.status === FoodStatus.COMPLETED).length;
  const cancelled = posts.filter(p => p.status === FoodStatus.CANCELLED).length;

  // --- CHARTS DATA ---
  const statusData = [
    { name: 'Available', value: pending },
    { name: 'In Progress', value: inProgress },
    { name: 'Completed', value: completed },
    { name: 'Cancelled', value: cancelled },
  ];
  
  // Custom Colors for Pie Chart
  const STATUS_COLORS = {
    'Available': '#F59E0B', // Amber
    'In Progress': '#3B82F6', // Blue
    'Completed': '#10B981', // Emerald
    'Cancelled': '#EF4444'  // Red
  };

  const allItems = posts.flatMap(p => p.items);
  const freshnessData = [
    { name: 'Fresh', count: allItems.filter(i => i.freshness === FreshnessLevel.FRESH).length },
    { name: 'Risky', count: allItems.filter(i => i.freshness === FreshnessLevel.RISKY).length },
    { name: 'Not Fresh', count: allItems.filter(i => i.freshness === FreshnessLevel.NOT_FRESH).length },
  ];

  // --- TOP DONORS CALCULATION ---
  const donorStats = posts.reduce((acc, post) => {
    acc[post.donorName] = (acc[post.donorName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDonors: [string, number][] = (Object.entries(donorStats) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center transition hover:shadow-md">
      <div className={`p-4 rounded-xl mr-4 ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 font-serif">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="pb-10 animate-fade-in">
      <div className="mb-8">
         <h1 className="text-3xl font-bold text-slate-900 font-serif">System Overview</h1>
         <p className="text-slate-500 mt-1">Real-time statistics and analytics.</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Donors" value={totalDonors} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Total NGOs" value={totalNgos} icon={Truck} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Total Donations" value={totalDonations} icon={Package} color="text-purple-600" bg="bg-purple-50" />
        <StatCard title="Platform Health" value="98%" icon={Activity} color="text-pink-600" bg="bg-pink-50" />
      </div>

      <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
        <Package className="mr-2 text-slate-400" size={20} />
        Donation Status Breakdown
      </h2>

      {/* Donation Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Pending / Available" value={pending} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Accepted / Active" value={inProgress} icon={Truck} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Completed" value={completed} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Cancelled" value={cancelled} icon={XCircle} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart: Status Distribution */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 font-serif text-xl border-b border-slate-50 pb-4">Donation Lifecycle</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(STATUS_COLORS as any)[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 font-medium mt-4">
            {statusData.map((d, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: (STATUS_COLORS as any)[d.name]}}></div>
                  {d.name}: <span className="ml-1 font-bold text-slate-700">{d.value}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Freshness */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 font-serif text-xl border-b border-slate-50 pb-4">AI Freshness Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={freshnessData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">Based on AI predictions of donated items.</p>
        </div>
      </div>

      {/* Top Donors Table (Read Only) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
           <h3 className="font-bold text-slate-800 flex items-center">
             <Award className="mr-2 text-primary-600" size={20} />
             Top Contributors
           </h3>
        </div>
        
        {topDonors.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No donation data available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Donor Name</th>
                  <th className="px-6 py-4">Donations Made</th>
                  <th className="px-6 py-4">Impact Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topDonors.map(([name, count], index) => (
                  <tr key={name} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-400">#{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-bold">
                        {count} Posts
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {count > 10 ? (
                        <span className="text-emerald-600 font-bold flex items-center"><Award size={14} className="mr-1"/> Gold Partner</span>
                      ) : count > 5 ? (
                        <span className="text-blue-600 font-bold">Silver Partner</span>
                      ) : (
                        <span className="text-slate-500">Contributor</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
