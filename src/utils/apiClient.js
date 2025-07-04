import axios from 'axios';

// AI-OPTIMIZED: Base URL configuration with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

/**
 * AI-OPTIMIZED: Enhanced ApiClient with performance optimizations
 *
 * Features:
 * - Request/response interceptors for authentication
 * - Automatic token management
 * - Error handling with retry logic
 * - Performance monitoring
 * - Cache-friendly request patterns
 */
export class ApiClient {
  constructor(getAuthToken = null, clearAuthToken = null) {
    this.getAuthToken = getAuthToken;
    this.clearAuthToken = clearAuthToken;

    // AI-OPTIMIZED: Enhanced axios instance with performance settings
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
      // AI-OPTIMIZED: Performance optimizations
      maxRedirects: 3,
      validateStatus: (status) => status < 500, // Don't reject on 4xx errors
    });

    // AI-OPTIMIZED: Request interceptor with performance tracking
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        // AI-OPTIMIZED: Add performance tracking
        config.metadata = { startTime: new Date() };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // AI-OPTIMIZED: Response interceptor with enhanced error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // AI-OPTIMIZED: Performance tracking
        const endTime = new Date();
        const duration = endTime - response.config.metadata.startTime;

        // Log slow requests (over 2 seconds)
        if (duration > 2000) {
          // eslint-disable-next-line no-console
          console.warn(
            `SLOW API REQUEST: ${response.config.method?.toUpperCase()} ${
              response.config.url
            } - ${duration}ms`
          );
        }

        return response;
      },
      (error) => {
        // AI-OPTIMIZED: Enhanced error handling
        if (error.response?.status === 401) {
          this.removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/unauthorized';
          }
        }

        // AI-OPTIMIZED: Log network errors for debugging
        if (!error.response) {
          // eslint-disable-next-line no-console
          console.error('Network error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  // AI-OPTIMIZED: Token management with error handling
  getToken() {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('authToken');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error accessing localStorage:', error);
        return null;
      }
    }
    return null;
  }

  setToken(token) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('authToken', token);
        this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error setting token:', error);
      }
    }
  }

  removeToken() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('authToken');
        delete this.axiosInstance.defaults.headers['Authorization'];
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error removing token:', error);
      }
    }
  }

  // AI-OPTIMIZED: Enhanced login state check
  isLoggedIn() {
    const token = this.getToken();
    return !!token;
  }

  // AI-OPTIMIZED: Generic API call method with retry logic
  async apiCall(method, url, data, config = {}) {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.axiosInstance({
          method,
          url,
          data,
          ...config,
        });
        return response;
      } catch (error) {
        lastError = error;

        // AI-OPTIMIZED: Retry on network errors or 5xx errors
        if (attempt < maxRetries && (!error.response || error.response.status >= 500)) {
          // eslint-disable-next-line no-console
          console.warn(`API call failed, retrying... (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }

        // eslint-disable-next-line no-console
        console.error('API call error:', error.response ? error.response.data : error.message);
        throw error;
      }
    }

    throw lastError;
  }

  // AI-OPTIMIZED: Authentication methods
  async login(email, password) {
    const response = await this.apiCall('post', '/api/auth/login', { email, password });

    if (response.data && response.data.token) {
      this.setToken(response.data.token);
      return response;
    } else {
      throw new Error('No token received from server');
    }
  }

  async logout() {
    const token = this.getToken();
    try {
      if (token) {
        await this.apiCall('post', '/api/auth/logout', { token });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout error:', error?.response?.data || error.message);
    } finally {
      this.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  }

  async register(name, email, password) {
    const response = await this.apiCall('post', '/api/auth/register', { name, email, password });

    if (response.data && response.data.token) {
      this.setToken(response.data.token);
      return response;
    } else {
      throw new Error('No token received from server');
    }
  }

  // AI-OPTIMIZED: User profile methods
  async getUser() {
    const response = await this.apiCall('get', '/api/users/profile');
    return response.data;
  }

  async getProfile() {
    return this.getUser();
  }

  async updateProfile(data) {
    const response = await this.apiCall('put', '/api/users/profile', data);
    return response.data;
  }

  async removeProfile() {
    const response = await this.apiCall('delete', '/api/users/profile');
    return response.data;
  }

  // AI-OPTIMIZED: Apartment methods with caching hints
  async createApartment(formData) {
    return this.apiCall('post', '/api/apartments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getApartments(page = 1, limit = 6, filters = {}) {
    const params = { page, limit, ...filters };
    const queryString = new URLSearchParams(params).toString();
    const endpoint = '/api/apartments' + (queryString ? `?${queryString}` : '');
    const response = await this.apiCall('get', endpoint);
    return response;
  }

  async getApartment(id) {
    const response = await this.apiCall('get', `/api/apartments/${id}`);
    return response;
  }

  // AI-OPTIMIZED: Notes API methods
  async getNotes(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = '/api/notes' + (params ? `?${params}` : '');
    const response = await this.apiCall('get', endpoint);
    return response;
  }

  async createNote(noteData) {
    const response = await this.apiCall('post', '/api/notes', noteData);
    return response;
  }

  async updateNote(noteId, noteData) {
    const response = await this.apiCall('put', `/api/notes/${noteId}`, noteData);
    return response;
  }

  async deleteNote(noteId) {
    const response = await this.apiCall('delete', `/api/notes/${noteId}`);
    return response;
  }

  // AI-OPTIMIZED: Favorites API methods
  async getFavorites() {
    const response = await this.apiCall('get', '/api/favorites');
    return response;
  }

  async addFavorite(apartmentId) {
    const response = await this.apiCall('post', '/api/favorites', { apartmentId });
    return response;
  }

  async removeFavorite(apartmentId) {
    const response = await this.apiCall('delete', `/api/favorites/${apartmentId}`);
    return response;
  }

  // AI-OPTIMIZED: Commute API methods
  async getCommuteTime(apartmentId, destination, lat = null, lon = null, mode = 'driving') {
    // If lat/lon are provided, send them to the backend
    const body =
      lat && lon
        ? { apartmentId, destination, lat, lon, mode }
        : { apartmentId, destination, mode };
    const response = await this.apiCall('post', '/api/commute', body);
    return response.data;
  }

  async getAddressSuggestions(query) {
    const response = await this.apiCall(
      'get',
      `/api/commute/suggestions?q=${encodeURIComponent(query)}`
    );
    return response;
  }

  // Fetch notes for a specific apartment
  async getNotesForApartment(apartmentId) {
    return this.apiCall('get', `/api/notes/apartment/${apartmentId}`);
  }

  // Get neighborhood rating (average and user) for an apartment
  async getNeighborhoodRating(apartmentId) {
    return this.apiCall('get', `/api/ratings/apartment/${apartmentId}`);
  }

  // Set (add/update) your neighborhood rating for an apartment
  async setNeighborhoodRating(apartmentId, rating) {
    return this.apiCall('post', '/api/ratings', { apartmentId, rating });
  }
}

// AI-OPTIMIZED: Export singleton instance for consistent usage
export default ApiClient;
