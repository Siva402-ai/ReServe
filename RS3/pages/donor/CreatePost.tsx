
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/mockDatabase';
import { predictFreshness } from '../../services/predictionService';
import { FreshnessLevel, FoodItem } from '../../types';
import { Sparkles, Loader2, Plus, Trash2, MapPin, Navigation, Search, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FRESHNESS_COLORS } from '../../constants';
import { loadGoogleMaps } from '../../utils/mapLoader';

// Extended type for Form State (storing dropdown values instead of raw data)
interface FormFoodItem {
  name: string;
  quantity: string; // Stores the numeric string "5"
  unit: string;     // Stores the unit "kg"
  quantityError?: string;
  type: string;
  
  // New Dropdown Values
  timeRange: string;      // <1 hr, 1-2 hrs, etc.
  storageMethod: string;  // Room Temp, Fridge, etc.
  visibleIssues: string;  // Yes, No

  freshness: FreshnessLevel;
}

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  
  // --- LOCATION STATE ---
  const [locationMode, setLocationMode] = useState<'AUTO' | 'MANUAL' | null>(null);
  const [autoLocation, setAutoLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [autoAddress, setAutoAddress] = useState<string>("GPS Location");
  
  // Manual Location State
  const [manualAddress, setManualAddress] = useState<string>(user?.address || '');
  const [manualCoords, setManualCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsMissing, setMapsMissing] = useState(false);

  // --- INIT GOOGLE MAPS AUTOCOMPLETE ---
  useEffect(() => {
    loadGoogleMaps().then(() => {
      setMapsReady(true);
      if (autoCompleteRef.current) {
        const autocomplete = new (window as any).google.maps.places.Autocomplete(autoCompleteRef.current, {
           types: ['geocode'],
           componentRestrictions: { country: "in" }
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
             const lat = place.geometry.location.lat();
             const lng = place.geometry.location.lng();
             const address = place.formatted_address || manualAddress;
             setManualCoords({ lat, lng });
             setManualAddress(address);
             setLocationMode('MANUAL');
             setLocationError(null);
          }
        });
      }
    }).catch(err => {
      if(err.message === "MISSING_KEY") {
        setMapsMissing(true);
      } else {
        console.warn("Maps API failed to load:", err);
      }
    });
  }, []);

  // --- ITEMS STATE ---
  const [items, setItems] = useState<FormFoodItem[]>([
    {
      name: '',
      quantity: '',
      unit: 'kg',
      type: 'Rice/Biryani',
      timeRange: '<1 hr',
      storageMethod: 'Room Temperature',
      visibleIssues: 'No',
      freshness: FreshnessLevel.UNKNOWN
    }
  ]);
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);

  // --- OPTIONS CONSTANTS ---
  const TIME_OPTIONS = ["<1 hr", "1–2 hrs", "2–4 hrs", "4–6 hrs", ">6 hrs"];
  const FOOD_TYPES = ["Rice/Biryani", "Curry/Gravy", "Bread/Chapati", "Fried items", "Sweets", "Others"];
  const STORAGE_OPTIONS = ["Room Temperature", "Fridge", "Hot Pack"];
  const ISSUE_OPTIONS = ["No", "Yes"];
  const UNIT_OPTIONS = ["kg", "packets", "liters", "pieces", "servings", "boxes"];

  // --- HANDLERS ---

  const handleAutoLocation = () => {
    setLocationMode('AUTO');
    setIsLocating(true);
    setLocationError(null);
    setManualCoords(null); 

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setAutoLocation({ lat, lng });
        
        if (mapsReady) {
           try {
             const geocoder = new (window as any).google.maps.Geocoder();
             const response = await geocoder.geocode({ location: { lat, lng } });
             if (response.results[0]) {
               setAutoAddress(response.results[0].formatted_address);
             } else {
               setAutoAddress(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
             }
           } catch (e) {
             setAutoAddress(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
           }
        } else {
           setAutoAddress(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("GPS Error", error);
        setLocationError("Failed to get location. Ensure GPS is enabled.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const addItem = () => {
    setItems([...items, { 
      name: '', 
      quantity: '', 
      unit: 'kg',
      type: 'Rice/Biryani',
      timeRange: '<1 hr', 
      storageMethod: 'Room Temperature', 
      visibleIssues: 'No',
      freshness: FreshnessLevel.UNKNOWN 
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof FormFoodItem, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Reset freshness if inputs change
    if (['name', 'type', 'timeRange', 'storageMethod', 'visibleIssues'].includes(field)) {
       newItems[index].freshness = FreshnessLevel.UNKNOWN;
    }
    
    // Quantity validation
    if (field === 'quantity') {
      if (value.trim() === '' || Number(value) <= 0) {
        newItems[index].quantityError = "Required";
      } else {
        newItems[index].quantityError = undefined;
      }
    }
    
    setItems(newItems);
  };

  const handleAnalyze = async (index: number) => {
    const item = items[index];
    if (!item.name) {
      alert("Please fill in the food name.");
      return;
    }
    setAnalyzingIndex(index);
    try {
      const result = await predictFreshness(
        item.name, 
        item.type, 
        item.timeRange, 
        item.storageMethod,
        item.visibleIssues
      );
      const newItems = [...items];
      newItems[index].freshness = result;
      setItems(newItems);
    } finally {
      setAnalyzingIndex(null);
    }
  };

  const hasUnsafeItems = items.some(item => 
    item.freshness === FreshnessLevel.RISKY || item.freshness === FreshnessLevel.NOT_FRESH
  );

  // Convert categorical time to approx Date for DB compatibility
  const getApproxDate = (range: string): string => {
    const now = new Date();
    switch(range) {
      case '<1 hr': now.setMinutes(now.getMinutes() - 30); break;
      case '1–2 hrs': now.setHours(now.getHours() - 1.5); break;
      case '2–4 hrs': now.setHours(now.getHours() - 3); break;
      case '4–6 hrs': now.setHours(now.getHours() - 5); break;
      case '>6 hrs': now.setHours(now.getHours() - 8); break;
    }
    return now.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (locationMode === 'AUTO' && !autoLocation) {
       alert("Please wait for GPS location to finish.");
       return;
    }
    
    if (locationMode === 'MANUAL') {
      if (!manualAddress.trim()) {
        alert("Please enter a valid address.");
        return;
      }
      if (!manualCoords && !mapsMissing) {
         const confirm = window.confirm("Address not verified on map. Use it anyway?");
         if (!confirm) return;
      }
    }

    if (!locationMode) {
       alert("Please select a location method.");
       return;
    }

    if (items.some(i => !i.quantity || i.quantityError)) {
      alert("Please enter a valid quantity for all items.");
      return;
    }

    setLoading(true);

    try {
      const finalItems = await Promise.all(items.map(async (item) => {
        if (item.freshness === FreshnessLevel.UNKNOWN) {
           const result = await predictFreshness(
             item.name, 
             item.type, 
             item.timeRange, 
             item.storageMethod,
             item.visibleIssues
           );
           return { ...item, freshness: result };
        }
        return item;
      }));

      if (finalItems.some(i => i.freshness === FreshnessLevel.RISKY || i.freshness === FreshnessLevel.NOT_FRESH)) {
        alert("Cannot donate: One or more items are identified as unsafe.");
        setItems(finalItems);
        setLoading(false);
        return;
      }

      const finalLocation = locationMode === 'MANUAL' 
        ? (manualCoords || { lat: 0, lng: 0 }) 
        : autoLocation!;
      
      const finalAddressDisplay = locationMode === 'MANUAL' ? manualAddress : autoAddress;

      mockDB.createPost({
        donorId: user.id,
        donorName: user.organization || user.name,
        donorAddress: finalAddressDisplay,
        items: finalItems.map(item => ({
          id: `i${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          quantity: `${item.quantity} ${item.unit}`, // Combine number and unit
          type: item.type,
          freshness: item.freshness,
          // Convert categorical inputs to standard DB format
          timePrepared: getApproxDate(item.timeRange),
          storageTemp: item.storageMethod
        })),
        location: finalLocation
      });

      navigate('/donor');
    } catch (error) {
      console.error(error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Donate Surplus Food</h1>
        <p className="text-slate-500">Share your surplus with those in need.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- LOCATION SECTION --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
             <MapPin className="mr-2 text-primary-600" size={20} />
             Pickup Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onClick={handleAutoLocation}
              className={`border-2 rounded-xl p-5 transition cursor-pointer relative ${locationMode === 'AUTO' ? 'border-primary-500 bg-primary-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
            >
              <div className="flex items-center mb-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${locationMode === 'AUTO' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Navigation size={16} />
                 </div>
                 <span className="font-bold text-slate-700">Auto GPS</span>
              </div>
              <button 
                type="button"
                className={`w-full py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center ${locationMode === 'AUTO' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isLocating ? <Loader2 className="animate-spin mr-2" size={16} /> : <Navigation className="mr-2" size={16} />}
                {isLocating ? 'Locating...' : 'Detect Location'}
              </button>
              {locationMode === 'AUTO' && autoLocation && (
                 <div className="mt-3">
                    <p className="text-xs text-slate-500 truncate">{autoAddress}</p>
                 </div>
              )}
            </div>

            <div className={`border-2 rounded-xl p-5 transition relative ${locationMode === 'MANUAL' ? 'border-primary-500 bg-white' : 'border-slate-100 hover:border-slate-200 bg-white'}`}>
              <div className="flex items-center mb-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${locationMode === 'MANUAL' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Search size={16} />
                 </div>
                 <span className="font-bold text-slate-700">Address Entry</span>
              </div>
              <input 
                  ref={autoCompleteRef}
                  type="text"
                  placeholder="Enter full address manually..."
                  value={manualAddress}
                  onChange={(e) => {
                    setManualAddress(e.target.value);
                    if(locationMode !== 'MANUAL') setLocationMode('MANUAL');
                    setManualCoords(null);
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg outline-none text-sm transition bg-white text-slate-900 ${locationMode === 'MANUAL' ? 'border-primary-500 ring-1 ring-primary-200' : 'border-slate-200'}`}
                />
            </div>
          </div>
        </div>

        {/* --- ITEMS SECTION --- */}
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-700">Item #{index + 1}</h3>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium">
                      <Trash2 size={16} className="mr-1" /> Remove
                    </button>
                  )}
              </div>
              
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Food Item Name</label>
                  <input required type="text" placeholder="e.g. Chicken Biryani" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none" value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Quantity</label>
                  <div className="flex gap-2">
                    <input 
                      required 
                      type="number"
                      min="1"
                      placeholder="5" 
                      className={`w-2/3 px-4 py-2.5 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none ${item.quantityError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200'}`}
                      value={item.quantity} 
                      onChange={e => updateItem(index, 'quantity', e.target.value)} 
                    />
                    <select
                      className="w-1/3 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      value={item.unit}
                      onChange={e => updateItem(index, 'unit', e.target.value)}
                    >
                      {UNIT_OPTIONS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  {item.quantityError && <p className="text-xs text-red-500 mt-1 font-bold">{item.quantityError}</p>}
                </div>
              </div>

              {/* Freshness Inputs */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">When was this cooked?</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      value={item.timeRange}
                      onChange={e => updateItem(index, 'timeRange', e.target.value)}
                    >
                      {TIME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Food Type</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      value={item.type}
                      onChange={e => updateItem(index, 'type', e.target.value)}
                    >
                      {FOOD_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Stored where?</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      value={item.storageMethod}
                      onChange={e => updateItem(index, 'storageMethod', e.target.value)}
                    >
                      {STORAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Any visible smell/look issues?</label>
                    <select 
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                      value={item.visibleIssues}
                      onChange={e => updateItem(index, 'visibleIssues', e.target.value)}
                    >
                      {ISSUE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                 </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Sparkles size={18} className="text-indigo-600 mr-2" />
                    <span className="text-sm font-bold text-slate-700 mr-2">Freshness AI:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${FRESHNESS_COLORS[item.freshness]}`}>
                      {item.freshness}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleAnalyze(index)}
                    disabled={analyzingIndex === index || item.freshness !== FreshnessLevel.UNKNOWN}
                    className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {analyzingIndex === index ? 'Scanning...' : 'Check Freshness'}
                  </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
           <button type="button" onClick={addItem} className="w-full md:w-auto flex items-center justify-center text-primary-600 font-bold hover:bg-primary-50 px-6 py-3 rounded-xl transition border border-dashed border-primary-200">
             <Plus size={20} className="mr-2" /> Add Item
           </button>
           
           <div className="flex flex-col items-center w-full md:w-auto">
             <button 
               type="submit" 
               disabled={loading || hasUnsafeItems} 
               className={`w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-xl transition flex items-center justify-center shadow-xl shadow-slate-200 ${hasUnsafeItems ? 'opacity-50 cursor-not-allowed hover:bg-slate-900' : ''}`}
             >
               {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
               Post Donation
             </button>
             {hasUnsafeItems && (
               <p className="text-red-500 text-sm mt-2 font-bold text-center">
                 Donation disabled: Food is not safe.
               </p>
             )}
           </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
