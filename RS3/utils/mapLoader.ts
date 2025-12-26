
import { MAPS_API_KEY, MAP_LIBRARIES } from '../config/keys';

let loadPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // If maps are already loaded, resolve immediately
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    // CRITICAL CHECK: Do not load script if key is missing
    if (!MAPS_API_KEY) {
      reject(new Error("MISSING_KEY"));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=${MAP_LIBRARIES.join(',')}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      reject(new Error("Failed to load Google Maps API (Network Error)"));
    };

    (window as any).initGoogleMaps = () => {
      resolve();
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};
