'use client';
import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { useRouter } from 'next/navigation';
// eslint-disable-next-line no-unused-vars
import SearchBar from '../components/SearchBar';
// eslint-disable-next-line no-unused-vars
import ListingCard from '../components/ListingCard';
import ApiClient from '@/utils/apiClient';
// eslint-disable-next-line no-unused-vars
import Sidebar from '../components/Sidebar';

export default function ListingsPage() {
  const [search, setSearch] = useState('');
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(6);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [toggleLoading, setToggleLoading] = useState(false);

  // Add filter state - make it optional by default
  const [filters, setFilters] = useState({
    minPrice: null, // null means no minimum
    maxPrice: null, // null means no maximum
    bedrooms: null, // null means no bedroom requirement
    radius: null, // null means no radius requirement
  });

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const apiClient = new ApiClient();
        if (!apiClient.isLoggedIn()) {
          window.location.href = 'auth/unauthorized';
          return;
        }

        // Only send filters that are actually set (not null)
        const activeFilters = {};
        Object.keys(filters).forEach((key) => {
          if (filters[key] !== null) {
            activeFilters[key] = filters[key];
          }
        });

        // Fetch apartments and user data in parallel
        const [apartmentsResponse, userData] = await Promise.all([
          apiClient.getApartments(page, limit, activeFilters),
          apiClient.getUser(),
        ]);

        if (Array.isArray(apartmentsResponse.data.apartments)) {
          setFlats(apartmentsResponse.data.apartments);
        } else {
          setFlats([]);
        }
        setPages(apartmentsResponse.data.pages);

        // Set favorite IDs from user data
        setFavoriteIds(new Set(userData.favorites || []));
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Failed to fetch apartments or favorites. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we're on the client side
    if (typeof window !== 'undefined') {
      fetchFlats();
    }
  }, [page, limit, filters]);

  const toggleFavorite = async (apartmentId) => {
    setToggleLoading(true);
    try {
      const apiClient = new ApiClient();
      if (favoriteIds.has(apartmentId)) {
        await apiClient.removeFavorite(apartmentId);
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(apartmentId);
          return newSet;
        });
      } else {
        await apiClient.addFavorite(apartmentId);
        setFavoriteIds((prev) => new Set(prev).add(apartmentId));
      }
    } catch (err) {
      // Handle error silently or add error handling here
    } finally {
      setToggleLoading(false);
    }
  };

  // Filter on client side as well - handle null values
  const filteredFlats = (flats || []).filter((flat) => {
    const matchesSearch = flat.title.toLowerCase().includes(search.toLowerCase());
    const matchesMinPrice = filters.minPrice === null || flat.price >= filters.minPrice;
    const matchesMaxPrice = filters.maxPrice === null || flat.price <= filters.maxPrice;
    const matchesBedrooms = filters.bedrooms === null || flat.bedrooms >= filters.bedrooms;
    // Radius filter is not implemented here, but you could add it if you have location data
    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBedrooms;
  });

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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
      {/* Filter Sidebar */}
      <div className="lg:w-64 lg:flex-shrink-0">
        <Sidebar filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Apartment Listings</h1>
            <p className="mb-6">Here you can browse all available apartments.</p>

            <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {filteredFlats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No apartments found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlats.map((flat, index) => (
                <div key={flat._id || index} className="h-full">
                  <ListingCard
                    apartment={flat}
                    priority={index < 3}
                    isFavorited={favoriteIds.has(flat._id)}
                    onToggleFavorite={() => toggleFavorite(flat._id)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pagination-controls flex justify-between items-center mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              « Prev
            </button>

            <span className="text-gray-600">
              Page {page} of {pages}
            </span>

            <button
              disabled={page === pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
