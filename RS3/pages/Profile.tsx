
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { User, Mail, Phone, MapPin, Building, Edit2, Check, X, ShieldCheck, Smartphone, Star } from 'lucide-react';
import { mockDB } from '../services/mockDatabase';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state to ensure we show live data (ratings) from DB even if AuthContext is slightly stale
  const [profileUser, setProfileUser] = useState(user);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    organization: user?.organization || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Sync profile data to get latest ratings
  useEffect(() => {
    const syncUser = () => {
        if (!user) return;
        const freshUser = mockDB.getUsers().find(u => u.id === user.id);
        if (freshUser) {
            setProfileUser(freshUser);
        }
    };
    
    syncUser();
    
    // Listen for DB updates (e.g. new reviews added)
    window.addEventListener('reserve_db_update', syncUser);
    window.addEventListener('storage', syncUser);
    
    return () => {
        window.removeEventListener('reserve_db_update', syncUser);
        window.removeEventListener('storage', syncUser);
    };
  }, [user]);

  if (!user || !profileUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const cancelEdit = () => {
    setFormData({
      name: user.name,
      organization: user.organization || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setIsEditing(false);
  };

  const handleVerifyPhone = () => {
    if (!formData.phone || formData.phone.length < 10) {
      alert("Please enter a valid phone number first.");
      return;
    }
    const sent = mockDB.sendOTP(formData.phone);
    if (sent) {
      setShowOtpModal(true);
      setOtpError('');
      setOtpInput('');
    }
  };

  const verifyOtp = () => {
    const result = mockDB.verifyOTP(formData.phone, otpInput);
    if (result.success) {
      updateProfile({ phoneVerified: true });
      setShowOtpModal(false);
      alert("Phone number verified successfully.");
    } else {
      setOtpError(result.message || "Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 relative">
      
      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl transform scale-100">
            <div className="text-center mb-6">
               <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                  <Smartphone size={32} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 font-serif">Verify Phone</h3>
               <p className="text-slate-500 mt-2">
                 Enter verification code sent to <br/><span className="font-bold text-slate-800">{formData.phone}</span>
               </p>
            </div>
            
            <div className="mb-6">
               <input 
                 type="text" 
                 maxLength={4}
                 placeholder="1234"
                 className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-b-2 border-slate-200 focus:border-primary-600 outline-none text-slate-800"
                 value={otpInput}
                 onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                       setOtpInput(e.target.value);
                       setOtpError('');
                    }
                 }}
               />
               {otpError && <p className="text-red-500 text-sm mt-3 text-center font-bold">{otpError}</p>}
            </div>

            <button 
              onClick={verifyOtp}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary-200 mb-4"
            >
              Verify Now
            </button>
            
            <button 
              onClick={() => setShowOtpModal(false)}
              className="w-full text-slate-500 font-bold text-sm hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">My Profile</h1>
          <p className="text-slate-500">Manage your account details.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header / Avatar Area */}
        <div className="bg-slate-50 p-8 border-b border-slate-100 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-4xl font-bold text-primary-600 mb-4">
              {profileUser.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{profileUser.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-slate-500 text-sm bg-slate-200 px-3 py-1 rounded-full font-medium">
                {profileUser.role}
              </span>
              {profileUser.phoneVerified && (
                <span className="text-emerald-700 text-sm bg-emerald-100 px-3 py-1 rounded-full font-bold flex items-center">
                  <ShieldCheck size={14} className="mr-1"/> Verified
                </span>
              )}
            </div>

            {/* NGO RATING DISPLAY */}
            {profileUser.role === UserRole.NGO && (
                <div className="mt-4 flex flex-col items-center">
                    <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-2xl font-bold text-slate-900 mr-2">
                            {profileUser.averageRating?.toFixed(1) || '0.0'}
                        </span>
                        <div className="flex text-yellow-400 mr-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    size={18} 
                                    fill={(profileUser.averageRating || 0) >= star ? "currentColor" : "none"} 
                                    className={(profileUser.averageRating || 0) >= star ? "text-yellow-400" : "text-slate-300"} 
                                />
                            ))}
                        </div>
                        <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                    </div>
                    <p className="text-slate-500 text-sm font-bold mt-2">
                        Total Reviews: <span className="text-slate-900">{profileUser.reviews?.length || 0}</span>
                    </p>
                </div>
            )}
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition ${isEditing ? 'border-primary-500 bg-white ring-2 ring-primary-100' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                />
              </div>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                 {profileUser.role === UserRole.DONOR ? 'Establishment Name' : 'Organization'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building size={18} />
                </div>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.organization}
                  onChange={e => setFormData({...formData, organization: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition ${isEditing ? 'border-primary-500 bg-white ring-2 ring-primary-100' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                />
              </div>
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  disabled
                  value={profileUser.email}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 pl-1">Email cannot be changed.</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Phone Number</span>
                {profileUser.phoneVerified ? (
                    <span className="text-emerald-600 flex items-center text-[10px] uppercase tracking-wide"><Check size={12} className="mr-1"/> Verified</span>
                ) : (
                    <span className="text-orange-500 text-[10px] uppercase tracking-wide font-bold">Unverified</span>
                )}
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                    </div>
                    <input 
                    type="tel" 
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition ${isEditing ? 'border-primary-500 bg-white ring-2 ring-primary-100' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                    />
                </div>
                {/* Verify Button for Existing Users */}
                {!profileUser.phoneVerified && (
                    <button 
                      type="button"
                      onClick={handleVerifyPhone}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 rounded-xl text-sm transition shadow-sm"
                    >
                      Verify
                    </button>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 top-3 pointer-events-none text-slate-400">
                  <MapPin size={18} />
                </div>
                <textarea 
                  rows={2}
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition ${isEditing ? 'border-primary-500 bg-white ring-2 ring-primary-100' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-100 flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} /> Update Profile
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
