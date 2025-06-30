const axios = require('axios');

// Utility for interacting with the Google Maps API (directions, geocode, place details)
// IMPORTANT: Used by commute controller for all Google Maps requests

class GoogleMapsClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  async getCommuteTime(origin, destination, mode = 'driving') {
    const response = await axios.get(`${this.baseUrl}/directions/json`, {
      params: {
        origin,
        destination,
        mode,
        key: this.apiKey,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      duration: leg.duration.text,
      distance: leg.distance.text,
      mode,
      route: route.overview_polyline.points,
    };
  }

  async getGeocode(address) {
    const response = await axios.get(`${this.baseUrl}/geocode/json`, {
      params: {
        address,
        key: this.apiKey,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    const result = response.data.results[0];
    return {
      formattedAddress: result.formatted_address,
      location: result.geometry.location,
      placeId: result.place_id,
    };
  }

  async getPlaceDetails(placeId) {
    const response = await axios.get(`${this.baseUrl}/place/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,rating,types',
        key: this.apiKey,
      },
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${response.data.status}`);
    }

    return response.data.result;
  }
}

module.exports = GoogleMapsClient;
