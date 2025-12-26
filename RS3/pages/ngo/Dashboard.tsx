
import React, { useEffect, useState } from 'react';
import { mockDB } from '../../services/mockDatabase';
import { FoodPost, FoodStatus, UserRole } from '../../types';
import { getCurrentLocation, calculateDistance } from '../../services/locationService';
import { FoodCard } from '../../components/FoodCard';
import { Search, Truck, Bell, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NgoDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  const [availablePosts, setAvailablePosts] = useState<(FoodPost & { distance: number })[]>([]);
  const [myPickups, setMyPickups] = useState<FoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const myLoc = currentLocation || await getCurrentLocation();
      if (!currentLocation) setCurrentLocation(myLoc);

      const securePosts = mockDB.getSecureFeed(user.id);
      
      const available = securePosts
        .filter(p => p.status === FoodStatus.AVAILABLE)
        .map(p => {
          // Check for valid coordinates to avoid huge distance errors (e.g. 0,0 vs Chennai)
          let dist = 0;
          if (p.location && p.location.lat !== 0 && p.location.lng !== 0) {
             dist = calculateDistance(myLoc, p.location);
          }
          return {
            ...p,
            distance: dist
          };
        })
        .sort((a, b) => a.distance - b.distance);

      setAvailablePosts(available);

      const mine = securePosts.filter(p => 
        p.acceptedNgoId === user.id && p.status !== FoodStatus.COMPLETED
      );
      setMyPickups(mine);

    } catch (err) {
      console.error("Data Load Error", err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    if(!user) return;
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { 'x-user-id': user.id }
      });
      if(res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (e) { }
  };

  const markRead = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { 'x-user-id': user?.id }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch(e) { }
  };

  useEffect(() => {
    loadData();
    loadNotifications();

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'reserve_posts' || e.key === 'reserve_last_update') {
            loadData();
        }
    };

    const handleCustomUpdate = () => {
        loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('reserve_db_update', handleCustomUpdate);

    const interval = setInterval(loadData, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('reserve_db_update', handleCustomUpdate);
      clearInterval(interval);
    };
  }, [user]);

  const handleAction = (post: FoodPost, actionType: string) => {
    if (!user) return;
    if (actionType === 'ACCEPT') {
      const updated = mockDB.acceptDonation(post.id, user);
      if (updated) {
         loadData();
         setActiveTab('active');
      } else {
        alert("Too late! This donation was just taken.");
        loadData();
      }
    } 
    else if (actionType === 'MARK_REACHED') {
      mockDB.markReached(post.id, user.id);
      loadData();
    }
    else if (actionType === 'CANCEL_PICKUP') {
      if(window.confirm("Are you sure you want to cancel this order? It will be made available to other NGOs.")) {
          mockDB.cancelPickup(post.id, user.id);
          loadData();
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <div className="mb-8 flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 font-serif">NGO Dashboard</h1>
           <p className="text-slate-500 text-sm mt-1">Real-time donation feed.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={loadData} className="p-3 text-slate-400 hover:text-primary-600 transition rounded-full hover:bg-slate-50" title="Refresh Feed">
               <RefreshCw size={20} />
            </button>

            <div className="relative">
            <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-3 bg-white rounded-full shadow-md border border-slate-100 hover:bg-slate-50 transition relative"
            >
                <Bell size={22} className="text-slate-600" />
                {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                </span>
                )}
            </button>
            {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden ring-1 ring-black/5">
                <div className="p-4 border-b border-slate-50 font-bold text-slate-800 flex justify-between items-center bg-slate-50/50">
                    <span>Notifications</span>
                    <button onClick={() => setShowNotifDropdown(false)}><X size={16} className="text-slate-400" /></button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-400">No new notifications.</p>
                    ) : (
                    notifications.map(n => (
                        <div key={n._id} onClick={() => markRead(n._id)} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition ${!n.isRead ? 'bg-primary-50/30' : ''}`}>
                           <p className="text-sm font-medium text-slate-800">{n.message}</p>
                        </div>
                    ))
                    )}
                </div>
                </div>
            )}
            </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('available')} className={`pb-4 px-6 font-bold text-sm transition relative whitespace-nowrap ${activeTab === 'available' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className="flex items-center">
            <Search size={18} className="mr-2" />
            Find Food <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'available' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>{availablePosts.length}</span>
          </div>
          {activeTab === 'available' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>}
        </button>
        <button onClick={() => setActiveTab('active')} className={`pb-4 px-6 font-bold text-sm transition relative whitespace-nowrap ${activeTab === 'active' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <div className="flex items-center">
             <Truck size={18} className="mr-2" />
             My Pickups <span className="ml-2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs shadow-sm">{myPickups.length}</span>
          </div>
          {activeTab === 'active' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'available' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availablePosts.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-400">No active donations nearby.</div>
              ) : (
                availablePosts.map(post => (
                  <FoodCard key={post.id} post={post} userRole={UserRole.NGO} currentUserId={user?.id} distance={post.distance} onAction={handleAction} ngoLocation={currentLocation || undefined} />
                ))
              )}
            </div>
          )}

          {activeTab === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myPickups.length === 0 ? (
                 <div className="col-span-full py-20 text-center text-slate-400">No active pickups.</div>
              ) : (
                myPickups.map(post => (
                  <FoodCard key={post.id} post={post} userRole={UserRole.NGO} currentUserId={user?.id} onAction={handleAction} ngoLocation={currentLocation || undefined} />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NgoDashboard;
