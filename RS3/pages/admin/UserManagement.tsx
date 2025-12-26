
import React, { useState, useEffect } from 'react';
import { mockDB } from '../../services/mockDatabase';
import { User } from '../../types';
import { Search, Filter, Power, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'DONOR' | 'NGO' | 'ADMIN' | 'RECIPIENT'>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Initial Load
    setUserList(mockDB.getUsers());
    
    // Listen for updates
    const handleUpdate = () => setUserList(mockDB.getUsers());
    window.addEventListener('reserve_db_update', handleUpdate);
    return () => window.removeEventListener('reserve_db_update', handleUpdate);
  }, []);

  const filteredUsers = userList.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleStatusToggle = (userId: string, currentStatus?: 'ACTIVE' | 'DISABLED') => {
    const newStatus = currentStatus === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    const success = mockDB.updateUserStatus(userId, newStatus);
    
    if (success) {
      showToast(`User account ${newStatus === 'ACTIVE' ? 'enabled' : 'disabled'} successfully`);
    } else {
      showToast("Failed to update status");
    }
  };

  const handleVerification = (userId: string, isApproved: boolean) => {
    const success = mockDB.verifyUser(userId, isApproved);
    if (success) {
        showToast(isApproved ? "User account Verified & Activated" : "User account Rejected");
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="pb-10 animate-fade-in">
      {toast && (
        <div className="fixed top-4 right-4 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in font-bold">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-serif">User Management</h1>
        <p className="text-slate-500 mt-1">Manage platform access, accounts, and verifications.</p>
      </div>

      {/* User Management Toolbar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter size={18} className="text-slate-400 mr-2" />
            {['ALL', 'DONOR', 'NGO', 'RECIPIENT', 'ADMIN'].map(role => (
              <button 
                key={role}
                onClick={() => setRoleFilter(role as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${roleFilter === role ? 'bg-primary-100 text-primary-800 border border-primary-200' : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'}`}
              >
                {role.charAt(0) + role.slice(1).toLowerCase()}s
              </button>
            ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map(user => {
            const isPending = user.verificationStatus === 'PENDING';
            const isVerified = user.verificationStatus === 'VERIFIED';
            
            return (
                <div key={user.id} className={`bg-white rounded-2xl p-6 border transition relative group hover:shadow-md ${user.accountStatus === 'DISABLED' ? 'border-red-100 bg-red-50/10' : isPending ? 'border-orange-200 ring-1 ring-orange-100' : 'border-slate-100'}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 ${user.role === 'NGO' ? 'bg-emerald-100 text-emerald-700' : user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.name.charAt(0)}
                            </div>
                            <div>
                            <h3 className="font-bold text-slate-900">{user.name}</h3>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">{user.role}</span>
                            </div>
                        </div>
                        {isPending ? (
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded flex items-center animate-pulse">
                                <AlertCircle size={12} className="mr-1" /> Pending
                            </span>
                        ) : user.accountStatus === 'DISABLED' ? (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded flex items-center">
                                <AlertCircle size={12} className="mr-1" /> Disabled
                            </span>
                        ) : (
                            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded flex items-center">
                                <CheckCircle size={12} className="mr-1" /> Active
                            </span>
                        )}
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-6">
                        <p className="flex items-center"><span className="w-6 opacity-50">@</span> {user.email}</p>
                        <p className="flex items-center"><span className="w-6 opacity-50">Org:</span> {user.organization || 'N/A'}</p>
                        <p className="flex items-center"><span className="w-6 opacity-50">Ph:</span> {user.phone || 'N/A'}</p>
                        {user.documentUrl && (
                            <a href={user.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline mt-2">
                                <FileText size={14} className="mr-1" /> View Document
                            </a>
                        )}
                    </div>

                    {/* ACTIONS */}
                    {isPending ? (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleVerification(user.id, true)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-bold text-sm transition"
                            >
                                Approve
                            </button>
                            <button 
                                onClick={() => handleVerification(user.id, false)}
                                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-xl font-bold text-sm transition"
                            >
                                Reject
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => handleStatusToggle(user.id, user.accountStatus)}
                            className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center transition ${
                            user.accountStatus === 'DISABLED' 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200' 
                                : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                            }`}
                        >
                            <Power size={18} className="mr-2" />
                            {user.accountStatus === 'DISABLED' ? 'Enable Account' : 'Disable Account'}
                        </button>
                    )}
                </div>
            );
        })}
        
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
