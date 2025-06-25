'use client';
import { useEffect, useState } from 'react';
import { ApiClient } from '../../../apiClient/apiClient';
import ListingCard from '../components/ListingCard';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiClient = new ApiClient();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await apiClient.getFavorites();
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) return <p>Loading your favorites...</p>;
  if (favorites.length === 0) return <p>No favorite apartments yet.</p>;

  return (
          <div className="mt-6 max-w-2/3 md:max-w-4xl mx-auto px-2">
      
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((apartment) => (
                  <ListingCard key={apartment._id} apartment={apartment} />
                ))}
              </div>
            </div>
        
  );
}
