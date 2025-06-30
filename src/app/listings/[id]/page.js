'use client';
import { useState, useEffect, useMemo } from 'react';
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
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
  });
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [notesFilter, setNotesFilter] = useState({
    search: '',
    category: 'all',
    priority: 'all',
    sortBy: 'newest',
  });
  const [message, setMessage] = useState('');

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
        const notesResponse = await apiClient.getNotes({ apartmentId: params.id });
        // eslint-disable-next-line no-console
        console.log('Notes fetched:', notesResponse.data);
        // Fix: set notes to array only
        const notesArr = Array.isArray(notesResponse.data?.data)
          ? notesResponse.data.data
          : Array.isArray(notesResponse.data)
          ? notesResponse.data
          : [];
        setNotes(notesArr);

        // Check if apartment is in user's favorites
        const favoritesResponse = await apiClient.getFavorites();
        const favoritesArr = Array.isArray(favoritesResponse.data?.data)
          ? favoritesResponse.data.data
          : Array.isArray(favoritesResponse.data)
          ? favoritesResponse.data
          : [];
        const isFav = favoritesArr.some((fav) => fav.apartment === params.id);
        setIsFavorite(isFav);
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
    try {
      const apiClient = new ApiClient();
      await apiClient.createNote({
        apartmentId: params.id,
        ...newNote,
      });

      // Re-fetch notes after adding
      const notesResponse = await apiClient.getNotes({ apartmentId: params.id });
      const notesArr = Array.isArray(notesResponse.data?.data)
        ? notesResponse.data.data
        : Array.isArray(notesResponse.data)
        ? notesResponse.data
        : [];
      setNotes(notesArr);

      setNewNote({ title: '', content: '', category: 'general', priority: 'medium' });
      setShowNoteForm(false);
      setMessage('Note added successfully!');

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error adding note:', err);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleEditNote = async (noteId, updatedNote, isEditing = false) => {
    if (isEditing) {
      setEditingNoteId(noteId);
      return;
    }

    try {
      const apiClient = new ApiClient();
      const response = await apiClient.updateNote(noteId, updatedNote);

      // Update the notes array with the updated note
      setNotes(notes.map((note) => (note._id === noteId ? response.data : note)));
      setEditingNoteId(null);
      setMessage('Note updated successfully!');

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update note:', err);
      alert('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const apiClient = new ApiClient();
      await apiClient.deleteNote(noteId);

      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete note:', err);
      alert('Failed to delete note. Please try again.');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const apiClient = new ApiClient();
      if (isFavorite) {
        await apiClient.removeFavorite(params.id);
      } else {
        await apiClient.addFavorite(params.id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to toggle favorite:', err);
    }
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

  // Filter and sort notes
  const filteredAndSortedNotes = notes
    .filter((note) => {
      const matchesSearch =
        !notesFilter.search ||
        note.title.toLowerCase().includes(notesFilter.search.toLowerCase()) ||
        note.content.toLowerCase().includes(notesFilter.search.toLowerCase());

      const matchesCategory =
        notesFilter.category === 'all' || note.category === notesFilter.category;
      const matchesPriority =
        notesFilter.priority === 'all' || note.priority === notesFilter.priority;

      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      switch (notesFilter.sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  // Debug logging
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Notes state:', notes);
    // eslint-disable-next-line no-console
    console.log('Notes filter:', notesFilter);
    // eslint-disable-next-line no-console
    console.log('Filtered notes:', filteredAndSortedNotes);
  }, [notes, notesFilter, filteredAndSortedNotes]);

  // Keyboard navigation for image slideshow
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (imageUrls.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        handleImageNavigation('prev');
      } else if (e.key === 'ArrowRight') {
        handleImageNavigation('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageUrls.length]);

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
            <div className="flex items-center gap-4">
              {getStatusBadge(status)}
              <button
                onClick={handleToggleFavorite}
                className={`p-3 rounded-full transition-colors ${
                  isFavorite
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>
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

            {/* Enhanced Notes Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Notes</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {notes.length} note{notes.length !== 1 ? 's' : ''} •{' '}
                    {filteredAndSortedNotes.length} showing
                  </p>
                </div>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showNoteForm ? 'Cancel' : 'Add Note'}
                </button>
              </div>

              {/* Success Message */}
              {message && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {message}
                  <button
                    onClick={() => setMessage('')}
                    className="float-right font-bold text-green-700 hover:text-green-900"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Notes Filter */}
              {notes.length > 0 && (
                <NotesFilter filters={notesFilter} onFilterChange={setNotesFilter} />
              )}

              {/* Add Note Form */}
              {showNoteForm && (
                <form onSubmit={handleAddNote} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Note title"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <select
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="pros">Pros</option>
                      <option value="cons">Cons</option>
                      <option value="visit">Visit Notes</option>
                      <option value="research">Research</option>
                      <option value="comparison">Comparison</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Write your note here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    required
                  />
                  <div className="flex justify-between items-center mt-4">
                    <select
                      value={newNote.priority}
                      onChange={(e) => setNewNote({ ...newNote, priority: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Note
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <p className="text-gray-500 text-lg mb-2">No notes yet</p>
                  <p className="text-gray-400 text-sm">
                    Add your first note to keep track of your thoughts about this apartment.
                  </p>
                </div>
              ) : filteredAndSortedNotes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notes match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedNotes.map((note, index) => (
                    <NoteCard
                      key={note._id || `temp-${index}`}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      isEditing={editingNoteId === note._id}
                    />
                  ))}
                </div>
              )}
            </div>
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              {location?.coordinates &&
              Array.isArray(location.coordinates) &&
              location.coordinates.length === 2 ? (
                <div className="h-48 rounded-lg overflow-hidden">
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
                <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Map not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
