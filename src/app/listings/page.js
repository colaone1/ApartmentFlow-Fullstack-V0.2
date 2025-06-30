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

  // Add filter state - make it mutable
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 3000,
    bedrooms: 0,
    radius: 10,
  });

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const apiClient = new ApiClient();
        if (!apiClient.isLoggedIn()) {
          window.location.href = 'auth/unauthorized';
          return;
        }
        // Pass filters to API
        const response = await apiClient.getApartments(page, limit, filters);
        // eslint-disable-next-line no-console
        console.log('API response:', response.data);
        if (Array.isArray(response.data.apartments)) {
          // eslint-disable-next-line no-console
          console.log('Apartments data received from API:', response.data.apartments);
          setFlats(response.data.apartments);
        } else {
          setFlats([]);
        }
        setPages(response.data.pages);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching apartments:', err);
        setError(
          err.response?.data?.message || 'Failed to fetch apartments. Please try again later.'
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

  // Filter on client side as well
  const filteredFlats = (flats || []).filter((flat) => {
    const matchesSearch = flat.title.toLowerCase().includes(search.toLowerCase());
    const matchesMinPrice = flat.price >= filters.minPrice;
    const matchesMaxPrice = flat.price <= filters.maxPrice;
    const matchesBedrooms = flat.bedrooms >= filters.bedrooms;
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
                  <ListingCard apartment={flat} priority={index < 3} />
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
