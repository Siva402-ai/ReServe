import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, Edit2, CheckCircle, Package, Clock, MapPin, Phone, Truck } from 'lucide-react';
import { mockDB } from '../../services/mockDatabase';
import { DeliveryRecord } from '../../types';

const RecipientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [peopleCount, setPeopleCount] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [ngoNames, setNgoNames] = useState<Record<string, string>>({});

  const loadData = () => {
    if (!user) return;

    // 1. Sync fresh user data (People Count)
    const freshUser = mockDB.getUsers().find(u => u.id === user.id);
    if (freshUser) {
      setPeopleCount(freshUser.peopleCount || 0);
    }
    
    // 2. Load deliveries sent to this recipient
    const myDeliveries = mockDB.getIncomingDeliveries(user.id);
    setDeliveries(myDeliveries.sort((a, b) => new Date(b.deliveryTime).getTime() - new Date(a.deliveryTime).getTime()));

    // 3. Build NGO Name lookup map
    const allUsers = mockDB.getUsers();
    const namesMap: Record<string, string> = {};
    allUsers.forEach(u => {
        if (u.role === 'NGO') {
            namesMap[u.id] = u.organization || u.name;
        }
    });
    setNgoNames(namesMap);
  };

  useEffect(() => {
    loadData();

    // Real-time listeners for updates (e.g. when NGO marks delivered)
    window.addEventListener('reserve_db_update', loadData);
    window.addEventListener('storage', loadData);

    return () => {
        window.removeEventListener('reserve_db_update', loadData);
        window.removeEventListener('storage', loadData);
    };
  }, [user]);

  const handleUpdateCount = () => {
    if (user) {
      const success = mockDB.updateRecipientCount(user.id, peopleCount);
      if (success) {
        setIsEditing(false);
      } else {
        alert("Failed to update count.");
      }
    }
  };

  const handleConfirmReceipt = (deliveryId: string) => {
    const success = mockDB.confirmReceipt(deliveryId);
    if(success) {
        alert("Receipt confirmed! Thank you.");
    }
  };

  if (!user) return null;

  return (
    <div className="pb-10 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 font-serif">{user.organization || user.name}</h1>
                <div className="flex items-center gap-4 text-slate-500 mt-2 text-sm">
                    <span className="flex items-center"><MapPin size={14} className="mr-1"/> {user.address}</span>
                    <span className="flex items-center"><Phone size={14} className="mr-1"/> {user.phone}</span>
                </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                    <Users size={24} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">People Count</p>
                    {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                            <input 
                                type="number" 
                                min="1"
                                className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-pink-500"
                                value={peopleCount}
                                onChange={(e) => setPeopleCount(parseInt(e.target.value) || 0)}
                            />
                            <button onClick={handleUpdateCount} className="bg-pink-600 text-white p-1.5 rounded-lg hover:bg-pink-700">
                                <CheckCircle size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-800">{peopleCount}</span>
                            <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-pink-600 transition">
                                <Edit2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
         </div>
      </div>

      {/* Main Content: Deliveries (Full Width) */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Package className="mr-2 text-slate-400" size={24} />
            Donation History & Incoming
        </h2>

        {deliveries.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No donations yet</h3>
                <p className="text-slate-500">Donations distributed to your home will appear here.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {deliveries.map(delivery => (
                    <div key={delivery.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center">
                                        <Truck size={12} className="mr-1.5" />
                                        Delivered by {ngoNames[delivery.ngoId] || 'Unknown NGO'}
                                    </span>
                                </div>
                                
                                <h3 className="font-bold text-slate-800 text-lg mb-1">
                                    {delivery.foodType}
                                </h3>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-xs">
                                        Qty: {delivery.quantity}
                                    </span>
                                    <span className="flex items-center">
                                        <Users size={14} className="mr-1.5"/> Donor: {delivery.donorName}
                                    </span>
                                    <span className="flex items-center">
                                        <Clock size={14} className="mr-1.5"/> {new Date(delivery.deliveryTime).toLocaleDateString()} • {new Date(delivery.deliveryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleConfirmReceipt(delivery.id)}
                                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center shadow-sm"
                                >
                                    <CheckCircle size={16} className="mr-2" />
                                    Confirm Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default RecipientDashboard;