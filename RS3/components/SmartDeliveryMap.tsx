
import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Clock, AlertTriangle, Map } from 'lucide-react';
import { FoodPost } from '../types';
import { loadGoogleMaps } from '../utils/mapLoader';
import { MAPS_API_KEY } from '../config/keys';

// Mock Recipients for Demo Logic
interface Recipient {
  id: string;
  name: string;
  location: { lat: number; lng: number };
}

const RECIPIENT_DB: Recipient[] = [
  { id: 'r1', name: "Orphanage", location: { lat: 13.0810, lng: 80.2710 } },
  { id: 'r2', name: "Care Home", location: { lat: 13.0837, lng: 80.2700 } },
  { id: 'r3', name: "Shelter", location: { lat: 13.0660, lng: 80.2480 } },
];

interface SmartDeliveryMapProps {
  ngoLocation: { lat: number; lng: number } | null;
  donors?: FoodPost[]; 
}

export const SmartDeliveryMap: React.FC<SmartDeliveryMapProps> = ({ ngoLocation, donors = [] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<'MISSING_KEY' | 'LOAD_ERROR' | null>(null);

  useEffect(() => {
    // Reset state on re-render
    setErrorType(null);
    setLoading(true);

    loadGoogleMaps()
      .then(() => {
        initMap();
      })
      .catch((err) => {
        setLoading(false);
        if (err.message === "MISSING_KEY") {
          setErrorType('MISSING_KEY');
        } else {
          setErrorType('LOAD_ERROR');
          console.error(err);
        }
      });

    const initMap = () => {
      if (!mapRef.current) return;
      const google = (window as any).google;
      const startLocation = ngoLocation || { lat: 13.0827, lng: 80.2707 };

      // Create Map
      const map = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: startLocation,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
        ]
      });

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(startLocation);

      // NGO Marker (Blue)
      new google.maps.Marker({
        position: startLocation,
        map: map,
        title: "NGO (Start/End)",
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });

      // Donor Markers (Green)
      donors.forEach(donor => {
        if(donor.location && donor.location.lat) {
            new google.maps.Marker({
            position: donor.location,
            map: map,
            title: `Donor: ${donor.donorName}`,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            });
            bounds.extend(donor.location);
        }
      });

      // Recipient Markers (Red)
      RECIPIENT_DB.forEach(r => {
        new google.maps.Marker({
          position: r.location,
          map: map,
          title: `Recipient: ${r.name}`,
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });
        bounds.extend(r.location);
      });

      // Calculate Optimized Route: NGO -> Recipients -> NGO
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // We use custom markers
        polylineOptions: { strokeColor: "#2563eb", strokeWeight: 4 }
      });

      const waypoints = RECIPIENT_DB.map(r => ({
        location: r.location,
        stopover: true
      }));

      directionsService.route({
        origin: startLocation,
        destination: startLocation, // Round trip
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
      }, (result: any, status: any) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          
          // Calculate Totals
          let dist = 0;
          let dur = 0;
          result.routes[0].legs.forEach((leg: any) => {
             dist += leg.distance.value;
             dur += leg.duration.value;
          });

          setRouteInfo({
            distance: (dist / 1000).toFixed(1) + " km",
            duration: Math.round(dur / 60) + " min"
          });
        } else {
          console.warn("Route calculation failed or zero results:", status);
        }
        setLoading(false);
        // Fit bounds only after route calculation to include route geometry
        map.fitBounds(bounds);
      });
    };
  }, [ngoLocation, donors]);

  // --- RENDER ERROR STATE ---
  if (errorType === 'MISSING_KEY') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col items-center justify-center h-[500px] p-8 text-center bg-slate-50">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <Map className="text-slate-400" size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Map Configuration Required</h3>
        <p className="text-slate-500 max-w-md mb-6">
          Google Maps integration requires a valid API key to function. 
          Please configure your environment variables.
        </p>
        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm text-left w-full max-w-lg overflow-x-auto">
          <p className="mb-2 text-slate-400">// .env file</p>
          <p>VITE_GOOGLE_MAPS_KEY="YOUR_API_KEY_HERE"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" aria-label="map-container">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Navigation className="mr-2 text-primary-600" size={20} />
          Optimized Delivery Route
        </h3>
        {routeInfo && (
          <div className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex gap-3">
             <span className="flex items-center"><Navigation size={12} className="mr-1 text-blue-500"/> {routeInfo.distance}</span>
             <span className="flex items-center"><Clock size={12} className="mr-1 text-orange-500"/> {routeInfo.duration}</span>
          </div>
        )}
      </div>
      
      <div className="w-full h-[500px] relative bg-slate-100">
         <div ref={mapRef} className="w-full h-full" />
         
         {loading && (
           <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
             <span className="text-slate-600 font-bold text-sm">Loading Delivery Route...</span>
           </div>
         )}
      </div>
    </div>
  );
};
