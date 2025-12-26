
import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../utils/mapLoader';
import { MapPin, Navigation } from 'lucide-react';

interface DeliveryMapProps {
  ngoLocation: { lat: number; lng: number };
  recipientLocation: { lat: number; lng: number };
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({ ngoLocation, recipientLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      initMap();
    }).catch(err => console.error("Map load failed", err));

    const initMap = () => {
      if (!mapRef.current) return;
      const google = (window as any).google;
      
      const map = new google.maps.Map(mapRef.current, {
        center: ngoLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });

      // Markers
      new google.maps.Marker({
        position: ngoLocation,
        map: map,
        title: "Your Location (NGO)",
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });

      new google.maps.Marker({
        position: recipientLocation,
        map: map,
        title: "Recipient Location",
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      });

      // Directions
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#2563eb", strokeWeight: 5 }
      });

      directionsService.route({
        origin: ngoLocation,
        destination: recipientLocation,
        travelMode: google.maps.TravelMode.DRIVING
      }, (result: any, status: any) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0].legs[0];
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text
          });
        }
      });
    };
  }, [ngoLocation, recipientLocation]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Navigation size={18} className="mr-2 text-primary-600" />
          Live Route
        </h3>
        {routeInfo && (
           <div className="flex gap-4 text-xs font-bold text-slate-600">
             <span>Dist: {routeInfo.distance}</span>
             <span>ETA: {routeInfo.duration}</span>
           </div>
        )}
      </div>
      <div ref={mapRef} className="w-full h-96 bg-slate-100" />
    </div>
  );
};
