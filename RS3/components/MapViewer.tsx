import React, { useEffect, useRef } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface MapViewerProps {
  donorLocation?: Location | null;
  ngoLocation?: Location | null;
  className?: string;
}

// Default Location: MG Auditorium, VIT Chennai
const DEFAULT_LOCATION = { lat: 12.9716, lng: 79.1555 };

export const MapViewer: React.FC<MapViewerProps> = ({ donorLocation, ngoLocation, className }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Google Maps API is loaded in the window
    if (!(window as any).google || !mapRef.current) {
      return;
    }

    // --- STEP 1: Determine Center ---
    // Priority: Donor > NGO > Default (VIT Chennai)
    let center = DEFAULT_LOCATION;
    if (donorLocation && donorLocation.lat && donorLocation.lng) {
      center = donorLocation;
    } else if (ngoLocation && ngoLocation.lat && ngoLocation.lng) {
      center = ngoLocation;
    }

    // --- STEP 2: Initialize Map ---
    const map = new (window as any).google.maps.Map(mapRef.current, {
      center: center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
    });

    // --- STEP 3: Add Markers ---
    
    // 3a. Donor Marker (Default Red Color)
    if (donorLocation && donorLocation.lat && donorLocation.lng) {
      new (window as any).google.maps.Marker({
        position: donorLocation,
        map: map,
        title: "Donor Location",
        // Default Google Maps marker is Red
      });
    }

    // 3b. NGO Marker (Blue Color to differentiate)
    if (ngoLocation && ngoLocation.lat && ngoLocation.lng) {
      new (window as any).google.maps.Marker({
        position: ngoLocation,
        map: map,
        title: "NGO Location",
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' 
      });
    }

    // 3c. Default Marker (Only if no specific locations provided)
    if ((!donorLocation || !donorLocation.lat) && (!ngoLocation || !ngoLocation.lat)) {
      new (window as any).google.maps.Marker({
        position: DEFAULT_LOCATION,
        map: map,
        title: "Default: MG Auditorium, VIT Chennai",
        label: "VIT"
      });
    }

  }, [donorLocation, ngoLocation]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-64 md:h-96 rounded-2xl shadow-inner bg-slate-100 ${className || ''}`}
      aria-label="Google Map showing donation location"
    />
  );
};