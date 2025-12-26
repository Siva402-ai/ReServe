
// Centralized configuration for API keys
// Usage: Create a .env file in the project root with VITE_GOOGLE_MAPS_KEY=your_key_here

const getApiKey = () => {
  try {
    const meta = import.meta as any;
    if (meta && meta.env) {
      return meta.env.VITE_GOOGLE_MAPS_KEY || "";
    }
  } catch (e) {
    console.warn("Failed to read environment variables", e);
  }
  return "";
};

export const MAPS_API_KEY = getApiKey();
export const MAP_LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];
