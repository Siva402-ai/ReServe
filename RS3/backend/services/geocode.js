const axios = require('axios');

/**
 * Converts an address string into latitude and longitude using Google Maps API.
 * STRICT MODE: Throws error if API Key is missing or Address is invalid.
 * @param {string} address 
 * @returns {Promise<{lat: number, lng: number}>}
 */
exports.geocodeAddress = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Configuration Error: GOOGLE_MAPS_API_KEY is missing in server environment.");
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: apiKey
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return { 
        lat: location.lat, 
        lng: location.lng 
      };
    } else if (response.data.status === 'ZERO_RESULTS') {
      throw new Error("Address not found. Please check the spelling or format.");
    } else {
      throw new Error(`Geocoding API Error: ${response.data.status} - ${response.data.error_message || ''}`);
    }
  } catch (error) {
    console.error("Geocoding Service Failed:", error.message);
    throw error; // Propagate error to controller
  }
};