
export interface Coordinates {
  lat: number;
  lng: number;
}

// Haversine formula for calculating distance between two coordinates in km
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLng = deg2rad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Number(d.toFixed(1));
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Fallback location (Chennai, Egmore) if permission denied for demo purposes
          // This ensures the demo data (also in Chennai) appears nearby
          console.warn("Location permission denied. Using fallback (Chennai Egmore).");
          resolve({ lat: 13.0827, lng: 80.2707 }); 
        }
      );
    }
  });
};
