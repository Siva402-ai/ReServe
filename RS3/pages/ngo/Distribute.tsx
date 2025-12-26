
import React, { useEffect, useState } from 'react';
import { mockDB } from '../../services/mockDatabase';
import { FoodPost, FoodStatus, DeliveryRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, User, Calendar, List, History, ChevronDown, MapPin, CheckCircle, X } from 'lucide-react';
import { FRESHNESS_COLORS } from '../../constants';
import { RecipientStaticMap } from '../../components/RecipientStaticMap';
import { MAPS_API_KEY } from '../../config/keys';

// Precomputed distances from VIT Chennai as per requirements
const DISTANCE_MAP: Record<string, number> = {
  'r_vasantham': 6,
  'r_elshadai': 12,
  'r_igm': 14,
  'r_karunyam': 15,
  'r_atheeswarar': 16
};

// Fallback Data to ensure dropdown is NEVER empty
const FALLBACK_RECIPIENTS = [
  {
    id: 'r_vasantham',
    name: 'Vasantham Charitable Trust',
    location: { lat: 12.8733, lng: 80.1329 },
    address: '1/246, 2nd Street, Rajiv Gandhi Nagar, Vengambakkam, Chennai, Tamil Nadu 600127',
    peopleCount: 55
  },
  {
    id: 'r_elshadai',
    name: 'El-Shadai Children Home',
    location: { lat: 12.818381, lng: 80.2286 },
    address: '37, Annai Theresa Street, Rajiv Gandhi Salai, Kazhipattur, Tamil Nadu 603103',
    peopleCount: 60
  },
  {
    id: 'r_igm',
    name: 'IGM Children Home',
    location: { lat: 12.8508845, lng: 80.0619286 },
    address: '3, 1st Cross St, Veerabaghu Nagar, Guduvancheri, Tamil Nadu 603202',
    peopleCount: 35
  },
  {
    id: 'r_karunyam',
    name: 'Karunyam Children Home',
    location: { lat: 12.8565, lng: 80.1721 },
    address: 'Plot No. 28, 100 6, Madha Koil Street, Sathidanandapuram, Ponmar, Chennai, Thazhambur, Tamil Nadu 600127',
    peopleCount: 45
  },
  {
    id: 'r_atheeswarar',
    name: 'Atheeswarar Charitable Trust',
    location: { lat: 12.9149904, lng: 80.0720171 },
    address: 'A2/344, Swaminagar - 4th Cross Street, Near Gayathri Mini Hall, Mudichur - Attai Company, Chennai, Tamil Nadu 600048',
    peopleCount: 80
  }
];

interface RecipientDisplay {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  address?: string;
  peopleCount: number;
  distance: number;
}

const DistributeFood: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  
  const [inventory, setInventory] = useState<FoodPost[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryRecord[]>([]);
  
  // Specific list for the 5 orphanages
  const [recipients, setRecipients] = useState<RecipientDisplay[]>([]);
  
  // Store selected recipient ID for each food item ID
  const [selections, setSelections] = useState<{[key: string]: string}>({});

  // Map Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapTargetRecipient, setMapTargetRecipient] = useState<RecipientDisplay | null>(null);

  const loadData = () => {
    if (!user) return;
    
    // 1. Inventory: COMPLETED pickups assigned to this NGO
    const posts = mockDB.getPosts().filter(p => 
      p.acceptedNgoId === user.id && 
      p.status === FoodStatus.COMPLETED
    );
    setInventory(posts);

    // 2. History: Today's deliveries
    const today = new Date().toISOString().split('T')[0];
    const history = mockDB.getDeliveryHistory(user.id, today);
    setDeliveryHistory(history);

    // 3. Recipients List (Dynamic People Count + Fixed Distances)
    // We combine DB users with fallback to ensure the list is never empty/stale
    const dbRecipients = mockDB.getRecipients();
    
    // Create a map of DB users for quick lookup
    const dbRecipientMap = new Map(dbRecipients.map(r => [r.id, r]));
    
    // Build the final list: Use DB data if available (for live peopleCount), else use Fallback
    const combinedRecipients = FALLBACK_RECIPIENTS.map(fallback => {
        const dbData = dbRecipientMap.get(fallback.id);
        return {
            ...fallback,
            // If DB has updated people count, use it. Otherwise use fallback default.
            peopleCount: dbData ? (dbData.peopleCount || fallback.peopleCount) : fallback.peopleCount,
            address: dbData?.address || fallback.address,
            distance: DISTANCE_MAP[fallback.id] // Always use fixed distance logic
        };
    });

    // Sort: Nearest First (6km -> 16km)
    const sortedRecipients = combinedRecipients.sort((a, b) => a.distance - b.distance);

    setRecipients(sortedRecipients);
  };

  useEffect(() => {
    loadData();

    // Listen for DB updates (e.g., Orphanage updates people count)
    const handleUpdate = () => loadData();
    window.addEventListener('reserve_db_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('reserve_db_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user]);

  // Flatten the posts to get a list of individual items with donor context
  const allItems = inventory.flatMap(post => 
    post.items.map((item, index) => ({
      ...item,
      uniqueId: `${post.id}-${index}`, // Composite unique ID for the UI key
      postId: post.id,
      donorId: post.donorId,
      donorName: post.donorName,
      receivedAt: post.completedAt || post.createdAt
    }))
  );

  const handleSelectionChange = (itemId: string, recipientId: string) => {
    setSelections(prev => ({
      ...prev,
      [itemId]: recipientId
    }));
  };

  const handleViewMap = (recipientId: string) => {
    const recipient = recipients.find(r => r.id === recipientId);
    if (recipient) {
        // Fallback: If no API key is present, open external Google Maps directly
        // This ensures the feature works even without configuration
        if (!MAPS_API_KEY) {
           const url = `https://www.google.com/maps?q=${recipient.location.lat},${recipient.location.lng}`;
           window.open(url, "_blank");
           return;
        }

        setMapTargetRecipient(recipient);
        setShowMapModal(true);
    }
  };

  const markCompleted = (item: any) => {
    if (!user) return;
    const recipientId = selections[item.uniqueId];
    if (!recipientId) return;

    const recipient = recipients.find(r => r.id === recipientId);
    
    mockDB.saveDeliveryRecord({
        ngoId: user.id,
        donorId: item.donorId,
        donorName: item.donorName,
        recipientId: recipientId,
        recipientName: recipient?.name || 'Unknown Recipient',
        foodType: item.name,
        quantity: item.quantity,
        pickupTime: item.receivedAt,
        deliveryTime: new Date().toISOString(),
        status: 'Completed',
        date: new Date().toISOString().split('T')[0]
    });

    alert("Delivery marked as completed 🎉");
    loadData(); // Refresh history
    setActiveTab('history'); 
  };

  return (
    <div className="relative">
      
      {/* MAP MODAL */}
      {showMapModal && mapTargetRecipient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     <MapPin size={20} className="text-primary-600" />
                     Location Details
                  </h3>
                  <button onClick={() => setShowMapModal(false)} className="text-slate-400 hover:text-slate-700">
                     <X size={24} />
                  </button>
               </div>
               
               <div className="p-4">
                  <RecipientStaticMap recipient={mapTargetRecipient} />
                  
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl text-sm border border-slate-100">
                     <p className="font-bold text-slate-800 text-lg mb-1">{mapTargetRecipient.name}</p>
                     <p className="text-slate-600">{mapTargetRecipient.address}</p>
                     <p className="mt-2 text-primary-700 font-bold">
                        Distance from VIT Chennai: {mapTargetRecipient.distance} km
                     </p>
                  </div>
               </div>
           </div>
        </div>
      )}

      <div className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 font-serif">Distribute Food</h1>
           <p className="text-slate-500 mt-1">Manage deliveries to orphanages and shelters.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`pb-4 px-6 font-bold text-sm transition relative whitespace-nowrap flex items-center ${activeTab === 'inventory' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Package size={18} className="mr-2" />
          Active Inventory
          {activeTab === 'inventory' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-6 font-bold text-sm transition relative whitespace-nowrap flex items-center ${activeTab === 'history' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <History size={18} className="mr-2" />
          Today's Deliveries
          {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 rounded-t-full"></span>}
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center">
                <List className="mr-2 text-primary-600" size={20} />
                Items to Distribute
            </h2>
            <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                {allItems.length} Items Available
            </span>
            </div>

            {allItems.length === 0 ? (
            <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No Food in Stock</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                Once you pick up food from donors, it will appear here for distribution.
                </p>
            </div>
            ) : (
            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                    <th className="px-6 py-4">Food Item</th>
                    <th className="px-6 py-4">Freshness</th>
                    <th className="px-6 py-4">Info</th>
                    <th className="px-6 py-4 w-1/3">Choose Recipient</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {allItems.map((item) => (
                    <tr key={item.uniqueId} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500 mb-1">{item.type}</p>
                        <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-600">
                            Qty: {item.quantity}
                        </span>
                        </td>
                        <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${FRESHNESS_COLORS[item.freshness]}`}>
                            {item.freshness}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center">
                            <User size={12} className="mr-1.5 text-slate-400" />
                            <span className="text-xs">{item.donorName}</span>
                            </div>
                            <div className="flex items-center" title="Time Prepared">
                            <Clock size={12} className="mr-1.5 text-slate-400" />
                            <span className="text-xs">Prep: {new Date(item.timePrepared).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center" title="Time Received">
                            <Calendar size={12} className="mr-1.5 text-slate-400" />
                            <span className="text-xs">Rcvd: {new Date(item.receivedAt).toLocaleString([], { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4">
                        <div className="relative">
                            <div className="space-y-3">
                                <div className="relative group">
                                    <select 
                                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium shadow-sm transition-all"
                                    value={selections[item.uniqueId] || ""}
                                    onChange={(e) => handleSelectionChange(item.uniqueId, e.target.value)}
                                    >
                                    <option value="" disabled>Select Recipient...</option>
                                    {recipients.map(r => (
                                        <option key={r.id} value={r.id}>
                                        {r.name} — {r.distance} km • {r.peopleCount} ppl
                                        </option>
                                    ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                                    <ChevronDown size={16} />
                                    </div>
                                </div>

                                {selections[item.uniqueId] && (
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => handleViewMap(selections[item.uniqueId])}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center transition shadow-sm"
                                        >
                                            <MapPin size={14} className="mr-2" />
                                            View Map
                                        </button>
                                        
                                        <button 
                                            onClick={() => markCompleted(item)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center transition shadow-sm"
                                        >
                                            <CheckCircle size={14} className="mr-2" />
                                            Mark Delivery as Completed
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 flex items-center">
                    <History className="mr-2 text-primary-600" size={20} />
                    Today's Completed Deliveries
                </h2>
            </div>
            {deliveryHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    No deliveries completed today yet.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Food Type</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Donor</th>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Completed Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {deliveryHistory.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 font-bold text-slate-800">{record.foodType}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.quantity}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.donorName}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.recipientName}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(record.deliveryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default DistributeFood;
