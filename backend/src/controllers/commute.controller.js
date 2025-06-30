const GoogleMapsClient = require('../utils/googleMapsClient');
const Apartment = require('../models/apartment.model');
const axios = require('axios');
const https = require('https');

const mapsClient = new GoogleMapsClient(process.env.GOOGLE_MAPS_API_KEY);

// IMPORTANT: Handles commute time and place details logic
// TODO: Add caching for frequent commute queries

/**
 * Get commute time and distance using OpenRouteService and Nominatim
 */
exports.getCommuteTime = async (req, res) => {
  try {
    const { apartmentId, destination, mode = 'driving' } = req.body;

    // Check if ORS API key is available
    if (!process.env.ORS_API_KEY) {
      console.error('ORS_API_KEY not found in environment variables');
      return res.status(500).json({ error: 'Routing service not configured' });
    }

    // Get apartment location
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    if (!apartment.location || !apartment.location.coordinates) {
      return res.status(400).json({ error: 'Apartment location not available' });
    }

    const [originLng, originLat] = apartment.location.coordinates;
    console.log('Origin coordinates:', { originLng, originLat });

    // Geocode destination using Nominatim
    const nominatimRes = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: destination,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'ApartmentSearch/1.0',
      },
    });
    if (!nominatimRes.data || nominatimRes.data.length === 0) {
      return res.status(404).json({ error: 'Destination address not found' });
    }
    const destLat = parseFloat(nominatimRes.data[0].lat);
    const destLng = parseFloat(nominatimRes.data[0].lon);
    console.log('Destination coordinates:', { destLng, destLat });

    // Map mode to ORS profile
    const modeMap = {
      driving: 'driving-car',
      walking: 'foot-walking',
      bicycling: 'cycling-regular',
      transit: 'driving-car', // ORS does not support transit, fallback to driving
    };
    const profile = modeMap[mode] || 'driving-car';

    // Call OpenRouteService Directions API
    let orsRes;
    try {
      console.log('Calling ORS API with profile:', profile);
      orsRes = await axios.post(
        'https://api.openrouteservice.org/v2/directions/' + profile,
        {
          coordinates: [
            [originLng, originLat],
            [destLng, destLat],
          ],
        },
        {
          headers: {
            Authorization: process.env.ORS_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('ORS API response status:', orsRes.status);
    } catch (orsError) {
      console.error('ORS API error:', orsError.response?.data || orsError.message);
      return res
        .status(502)
        .json({
          error: 'Routing provider error',
          details: orsError.response?.data || orsError.message,
        });
    }

    if (!orsRes.data || !orsRes.data.features || !orsRes.data.features[0]) {
      console.error('ORS API returned no route data:', orsRes.data);
      return res.status(404).json({ error: 'No route found between origin and destination' });
    }

    const route = orsRes.data.features[0];
    const summary = route.properties.summary;
    const distanceKm = summary.distance / 1000;
    const durationMin = summary.duration / 60;

    res.json({
      success: true,
      data: {
        distance: {
          value: summary.distance,
          text: `${distanceKm.toFixed(2)} km`,
        },
        duration: {
          value: summary.duration,
          text: `${durationMin.toFixed(1)} min`,
        },
        mode: profile,
        destination: nominatimRes.data[0].display_name,
      },
    });
  } catch (error) {
    console.error('Error getting commute time:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error getting commute time',
      details: error.response?.data || error.message,
    });
  }
};

exports.getMultipleCommuteTimes = async (req, res) => {
  try {
    const { apartmentId, destinations, mode = 'driving' } = req.body;

    // Get apartment location
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    const origin = `${apartment.location.coordinates[1]},${apartment.location.coordinates[0]}`;

    // Get commute times for all destinations
    const commutePromises = destinations.map((destination) =>
      mapsClient.getCommuteTime(origin, destination, mode)
    );

    const commuteResults = await Promise.all(commutePromises);

    res.json({
      success: true,
      data: commuteResults,
    });
  } catch (error) {
    console.error('Error getting multiple commute times:', error);
    res.status(500).json({
      error: 'Error getting commute times',
      details: error.message,
    });
  }
};

exports.getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;

    const placeDetails = await mapsClient.getPlaceDetails(placeId);

    res.json({
      success: true,
      data: placeDetails,
    });
  } catch (error) {
    console.error('Error getting place details:', error);
    res.status(500).json({
      error: 'Error getting place details',
      details: error.message,
    });
  }
};

/**
 * Get address suggestions using OpenStreetMap's Nominatim API
 * WARNING: The current SSL certificate validation is disabled for development.
 * TODO: Enable proper SSL validation before deploying to production.
 */
exports.getAddressSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log('Searching for address:', q);

    // Create a custom HTTPS agent that's more lenient with SSL validation
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // WARNING: Only for development! Remove in production
    });

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: q,
        format: 'json',
        limit: 5,
        addressdetails: 1,
        // countrycodes removed for worldwide search
      },
      httpsAgent,
      headers: {
        'User-Agent': 'ApartmentSearch/1.0', // Adding user agent as per Nominatim's usage guidelines
      },
    });

    if (!Array.isArray(response.data)) {
      console.error('Unexpected response from Nominatim:', response.data);
      return res.status(502).json({ error: 'Invalid response from address provider' });
    }

    // Map Nominatim response to match frontend expectations
    const suggestions = response.data.map((item) => ({
      address: item.display_name,
      placeId: item.place_id,
      lat: item.lat,
      lon: item.lon,
    }));

    console.log('Mapped suggestions:', suggestions);

    res.json(suggestions);
  } catch (error) {
    if (error.response) {
      // Received a response from Nominatim but it was an error
      console.error('Nominatim error:', error.response.status, error.response.data);
      res.status(502).json({ error: 'Address provider error', details: error.response.data });
    } else if (error.request) {
      // No response received
      console.error('No response from Nominatim:', error.message);
      res.status(504).json({ error: 'No response from address provider', details: error.message });
    } else {
      // Other errors
      console.error('Error fetching address suggestions:', error.message);
      res
        .status(500)
        .json({ error: 'Failed to fetch address suggestions', details: error.message });
    }
  }
};
