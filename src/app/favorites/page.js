'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
// eslint-disable-next-line no-unused-vars
import ListingCard from '../components/ListingCard';
import ApiClient from '@/utils/apiClient';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiClient = new ApiClient();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;

      try {
        // eslint-disable-next-line no-console
        console.log('Fetching favorites...');
        const response = await apiClient.getFavorites();
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isLoggedIn]);

  const handleFavoriteChange = (apartmentId, isNowFavorited) => {
    if (!isNowFavorited) {
      setFavorites((prev) => prev.filter((apt) => apt._id !== apartmentId));
    }
  };

  if (loading) return <p>Loading your favorites...</p>;
  if (favorites.length === 0) return <p>No favorite apartments yet.</p>;

  return (
    <div className="mt-6 max-w-2/3 md:max-w-4xl mx-auto px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favorites.map((apartment) => (
          <ListingCard
            key={apartment._id}
            apartment={apartment}
            onFavoriteChange={handleFavoriteChange}
          />
        ))}
      </div>
    </div>
  );
}
