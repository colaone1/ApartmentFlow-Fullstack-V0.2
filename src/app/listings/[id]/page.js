'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
// eslint-disable-next-line no-unused-vars
import Image from 'next/image';
import ApiClient from '@/utils/apiClient';
// eslint-disable-next-line no-unused-vars
import NoteCard from '../../components/NoteCard';
// eslint-disable-next-line no-unused-vars
import NotesFilter from '../../components/NotesFilter';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for react-leaflet components (client-side only)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export default function ApartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [message, setMessage] = useState('');
  const [commuteAddress, setCommuteAddress] = useState('');
  const [commuteSuggestions, setCommuteSuggestions] = useState([]);
  const [commuteLoading, setCommuteLoading] = useState(false);
  const [commuteError, setCommuteError] = useState('');
  const [commuteResult, setCommuteResult] = useState(null);
  const [commuteDestination, setCommuteDestination] = useState({
    address: '',
    lat: null,
    lon: null,
  });
  const commuteInputRef = useRef();
  const [neighborhoodRating, setNeighborhoodRating] = useState({
    average: null,
    count: 0,
    userRating: null,
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const imageUrls = useMemo(() => {
    if (!apartment || !apartment.images) return ['/default-image.png'];
    return apartment.images.map((img) => {
      if (!img.url || img.url.trim() === '') {
        return '/default-image.png';
      }
      if (img.url.startsWith('http://') || img.url.startsWith('https://')) {
        return img.url;
      }
      return `${backendUrl}/${img.url.replace(/\\/g, '/').replace(/^\//, '')}`;
    });
  }, [apartment, backendUrl]);

  useEffect(() => {
    const fetchApartmentDetails = async () => {
      try {
        const apiClient = new ApiClient();
        if (!apiClient.isLoggedIn()) {
          router.push('/auth/unauthorized');
          return;
        }

        // eslint-disable-next-line no-console
        console.log('Fetching apartment details for ID:', params.id);
        const response = await apiClient.getApartment(params.id);
        setApartment(response.data);

        // Fetch notes for this apartment
        // eslint-disable-next-line no-console
        console.log('Fetching notes for apartment:', params.id);
        const notesResponse = await apiClient.getNotesForApartment(params.id);
        // eslint-disable-next-line no-console
        console.log('Notes fetched:', notesResponse.data);
        // Fix: set notes to array only
        const notesArr = Array.isArray(notesResponse.data?.data)
          ? notesResponse.data.data
          : Array.isArray(notesResponse.data)
          ? notesResponse.data
          : [];
        setNotes(notesArr);

        // Fetch neighborhood rating
        const ratingResponse = await apiClient.getNeighborhoodRating(params.id);
        setNeighborhoodRating(ratingResponse.data);

        // Check if apartment is in user's favorites
        const favoritesResponse = await apiClient.getFavorites();
        const favoritesArr = Array.isArray(favoritesResponse.data?.data)
          ? favoritesResponse.data.data
          : Array.isArray(favoritesResponse.data)
          ? favoritesResponse.data
          : [];
        const isFav = favoritesArr.some((fav) => fav.apartment === params.id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching apartment:', err);
        setError(err.response?.data?.message || 'Failed to fetch apartment details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchApartmentDetails();
    }
  }, [params.id, router]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    try {
      const apiClient = new ApiClient();
      await apiClient.createNote({ apartmentId: params.id, content: newNoteContent });
      // Re-fetch notes after adding
      const notesResponse = await apiClient.getNotesForApartment(params.id);
      setNotes(Array.isArray(notesResponse.data?.data) ? notesResponse.data.data : []);
      setNewNoteContent('');
      setMessage('Note added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Failed to add note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const apiClient = new ApiClient();
      await apiClient.deleteNote(noteId);
      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (err) {
      alert('Failed to delete note. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImageNavigation = (direction) => {
    if (imageUrls.length <= 1) return;

    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
    } else if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const formatAmenities = (amenities) => {
    if (!amenities || amenities.length === 0) return [];
    return Array.isArray(amenities) ? amenities : amenities.split(',').map((item) => item.trim());
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { text: 'Available', color: 'bg-green-100 text-green-800' },
      rented: { text: 'Rented', color: 'bg-red-100 text-red-800' },
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      unavailable: { text: 'Unavailable', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.available;
    return (
      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Fetch address suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!commuteAddress || commuteAddress.trim().length < 3) {
        setCommuteSuggestions([]);
        return;
      }
      try {
        const apiClient = new ApiClient();
        const res = await apiClient.getAddressSuggestions(commuteAddress);
        setCommuteSuggestions(res.data || []);
      } catch (err) {
        setCommuteSuggestions([]);
      }
    };
    const timeout = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timeout);
  }, [commuteAddress]);

  // Handle selecting a suggestion
  const handleSuggestionClick = (suggestion) => {
    setCommuteAddress(suggestion.address);
    setCommuteDestination({
      address: suggestion.address,
      lat: suggestion.lat,
      lon: suggestion.lon,
    });
    setCommuteSuggestions([]);
    if (commuteInputRef.current) {
      commuteInputRef.current.value = suggestion.address;
    }
  };

  // Handle commute calculation
  const handleCommuteSubmit = async (e) => {
    e.preventDefault();
    setCommuteLoading(true);
    setCommuteError('');
    setCommuteResult(null);
    try {
      console.log('Calculating commute from apartment:', params.id, 'to:', commuteDestination);
      const apiClient = new ApiClient();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 30000)
      );
      // Send lat/lon if available, otherwise fallback to address string
      const commutePromise = apiClient.getCommuteTime(
        params.id,
        commuteDestination.address,
        commuteDestination.lat,
        commuteDestination.lon
      );
      const res = await Promise.race([commutePromise, timeoutPromise]);
      console.log('Commute calculation result:', res);
      if (res.error) {
        setCommuteError(res.error);
      } else if (res.success && res.data) {
        setCommuteResult(res.data);
      } else {
        setCommuteError('Unknown error calculating commute');
      }
    } catch (err) {
      setCommuteError(err.message || 'Failed to calculate commute');
    } finally {
      setCommuteLoading(false);
    }
  };

  const handleSetRating = async (rating) => {
    setRatingLoading(true);
    try {
      const apiClient = new ApiClient();
      await apiClient.setNeighborhoodRating(params.id, rating);
      const ratingResponse = await apiClient.getNeighborhoodRating(params.id);
      setNeighborhoodRating(ratingResponse.data);
    } catch (err) {
      alert('Failed to set rating. Please try again.');
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <p className="text-xl font-semibold mb-4">Apartment not found</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { title, description, price, location, bedrooms, bathrooms, area, amenities, status } =
    apartment;
  const { address } = location || {};
  const displayAmenities = formatAmenities(amenities);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Listings
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-xl text-gray-600 mb-4">
                {address?.street}, {address?.city}, {address?.state} {address?.zipCode}
              </p>
            </div>
            <div className="flex items-center gap-4">{getStatusBadge(status)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="relative h-96">
                {imageError ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📷</div>
                      <p className="text-gray-500">Image not available</p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={imageUrls[currentImageIndex]}
                    alt={title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg shadow-md"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                )}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 hover:scale-110"
                      aria-label="Previous image"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 hover:scale-110"
                      aria-label="Next image"
                    >
                      →
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {imageUrls.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {imageUrls.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                        index === currentImageIndex
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{area}</div>
                  <div className="text-sm text-gray-600">sq ft</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    £{price?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
              </div>

              {description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{description}</p>
                </div>
              )}

              {displayAmenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {displayAmenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes Section */}
            <section className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">My Notes</h2>
              <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
                <input
                  type="text"
                  className="flex-1 border rounded px-2 py-1"
                  placeholder="Add a note..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
                  Add
                </button>
              </form>
              {message && <div className="text-green-600 mb-2">{message}</div>}
              <ul>
                {notes.length === 0 && <li className="text-gray-500">No notes yet.</li>}
                {notes.map((note) => (
                  <li key={note._id} className="flex justify-between items-center border-b py-2">
                    <div>
                      <div>{note.content}</div>
                      <div className="text-xs text-gray-400">{formatDate(note.createdAt)}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-500 hover:underline ml-4"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Neighborhood Rating Section */}
            <section className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Neighborhood Rating</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Average:</span>
                {typeof neighborhoodRating.average === 'number' &&
                !isNaN(neighborhoodRating.average) ? (
                  <span className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={
                          i <= Math.round(neighborhoodRating.average)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-gray-600">
                      {neighborhoodRating.average.toFixed(2)} / 5
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({neighborhoodRating.count} rating{neighborhoodRating.count !== 1 ? 's' : ''})
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-500">No ratings yet</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    className={
                      i <= (neighborhoodRating.userRating || 0)
                        ? 'text-yellow-400 text-2xl'
                        : 'text-gray-300 text-2xl'
                    }
                    onClick={() => handleSetRating(i)}
                    disabled={ratingLoading}
                    aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
                {neighborhoodRating.userRating && (
                  <span className="ml-2 text-gray-600">{neighborhoodRating.userRating} / 5</span>
                )}
                {ratingLoading && <span className="ml-2 text-blue-500">Saving...</span>}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  £{price?.toLocaleString()}
                </div>
                <div className="text-gray-600 mb-4">per month</div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mb-3">
                  Contact Landlord
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                  Schedule Viewing
                </button>
              </div>
            </div>

            {/* Neighborhood Info Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Neighborhood</h3>
              <p className="text-gray-600 text-sm mb-4">
                Neighborhood ratings and information will be displayed here.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Safety</span>
                  <span className="text-gray-400">Coming soon</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport</span>
                  <span className="text-gray-400">Coming soon</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amenities</span>
                  <span className="text-gray-400">Coming soon</span>
                </div>
              </div>
            </div>

            {/* Location Map Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              {location?.coordinates &&
              Array.isArray(location.coordinates) &&
              location.coordinates.length === 2 ? (
                <div className="h-48 rounded-lg overflow-hidden mb-4">
                  <MapContainer
                    center={[location.coordinates[1], location.coordinates[0]]}
                    zoom={15}
                    scrollWheelZoom={true}
                    zoomControl={true}
                    minZoom={1}
                    maxZoom={18}
                    style={{ height: '100%', width: '100%' }}
                    key={`map-${location.coordinates[0]}-${location.coordinates[1]}`}
                  >
                    <TileLayer
                      attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.coordinates[1], location.coordinates[0]]}>
                      <Popup>
                        {title}
                        <br />
                        {address?.street}, {address?.city}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500">Map not available</p>
                </div>
              )}
              {/* Commute Feature */}
              <div className="mt-2">
                <h4 className="font-semibold text-gray-800 mb-2">Commute to...</h4>
                <form onSubmit={handleCommuteSubmit} className="mb-2">
                  <input
                    ref={commuteInputRef}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter address (e.g. work, school)"
                    value={commuteAddress}
                    onChange={(e) => {
                      setCommuteAddress(e.target.value);
                      setCommuteError('');
                      setCommuteResult(null);
                    }}
                    autoComplete="off"
                  />
                  {commuteSuggestions.length > 0 && (
                    <ul className="bg-white border border-gray-200 rounded-lg shadow-md mt-1 max-h-40 overflow-y-auto z-10 absolute w-72">
                      {commuteSuggestions.map((s) => (
                        <li
                          key={s.placeId}
                          className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                          onClick={() => handleSuggestionClick(s)}
                        >
                          {s.address}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="submit"
                    className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={commuteLoading || !commuteAddress}
                  >
                    {commuteLoading ? 'Calculating...' : 'Calculate Commute'}
                  </button>
                </form>
                {commuteError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Commute calculation failed
                        </h3>
                        <div className="mt-1 text-sm text-red-700">{commuteError}</div>
                        <div className="mt-2 text-xs text-red-600">
                          Try entering a different address or check if the apartment has a valid
                          location.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {commuteResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Commute calculated successfully
                        </h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Distance:</span>
                            <span className="font-medium text-green-800">
                              {commuteResult.distance?.text || commuteResult.distance || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-700">Duration:</span>
                            <span className="font-medium text-green-800">
                              {commuteResult.duration?.text || commuteResult.duration || 'N/A'}
                            </span>
                          </div>
                          {commuteResult.mode && (
                            <div className="flex justify-between text-sm">
                              <span className="text-green-700">Mode:</span>
                              <span className="font-medium text-green-800 capitalize">
                                {commuteResult.mode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
