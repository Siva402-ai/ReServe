import React, { useState } from 'react';
import { MAPS_API_KEY } from '../config/keys';
import { Map, AlertTriangle } from 'lucide-react';

// VIT Chennai Coordinates (Fixed for NGO Location)
const VIT_CHENNAI = { lat: 12.8733, lng: 80.1329 };

interface RecipientStaticMapProps {
  recipient: {
    name: string;
    address?: string;
    location: { lat: number; lng: number };
  };
}

export const RecipientStaticMap: React.FC<RecipientStaticMapProps> = ({ recipient }) => {
  const [hasError, setHasError] = useState(false);

  // Check for API Key existence
  if (!MAPS_API_KEY) {
     return (
         <div className="w-full h-[400px] bg-slate-50 flex flex-col items-center justify-center text-slate-400 border border-slate-200 rounded-2xl p-6 text-center">
            <AlertTriangle size={48} className="mb-4 opacity-50 text-amber-500" />
            <h3 className="font-bold text-slate-700 text-lg">Map Key Missing</h3>
            <p className="text-sm text-slate-500 max-w-xs mt-2">
               Please configure <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">VITE_GOOGLE_MAPS_KEY</code> in your environment variables.
            </p>
         </div>
     );
  }

  // Construct Static Map URL
  // Center on Recipient to ensure they are visible
  const center = `${recipient.location.lat},${recipient.location.lng}`;
  const zoom = 12; // Zoom 12 usually fits ~15km range well
  const size = "600x400";
  
  // Marker 1: NGO (Blue)
  const markerNgo = `color:blue|label:N|${VIT_CHENNAI.lat},${VIT_CHENNAI.lng}`;
  // Marker 2: Recipient (Red)
  const markerRecipient = `color:red|label:R|${recipient.location.lat},${recipient.location.lng}`;
  
  // Markers must be properly encoded for URL
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${size}&maptype=roadmap&markers=${encodeURIComponent(markerNgo)}&markers=${encodeURIComponent(markerRecipient)}&key=${MAPS_API_KEY}`;

  if (hasError) {
      return (
         <div className="w-full h-[400px] bg-slate-50 flex flex-col items-center justify-center text-slate-400 border border-slate-200 rounded-2xl">
            <Map size={48} className="mb-2 opacity-30" />
            <p className="font-bold text-slate-600">Unable to load map</p>
            <p className="text-xs">Check API Key permissions or quota.</p>
         </div>
      );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
       <div className="w-full h-[400px] bg-slate-100 relative group">
          <img 
            src={mapUrl} 
            alt={`Map showing ${recipient.name}`} 
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
       </div>
       
       <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-500">
          <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block border border-white shadow-sm"></span> VIT Chennai (NGO)
          </div>
          <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block border border-white shadow-sm"></span> Recipient Location
          </div>
       </div>
    </div>
  );
};