'use client';

import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import ProfileCard from '../components/ProfileCard';

const ProfilePage = () => {
  const { user, loading, deleteAccount } = useAuth();
  const [confirmMessage, setConfirmMessage] = useState(false);

  const handleDelete = async () => {
    if (confirmMessage) {
      try {
        await deleteAccount();
      } catch (err) {
        // Handle error silently or show user-friendly message
      }
    } else {
      setConfirmMessage(true);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to view your profile.</p>;

  return <ProfileCard user={user} onDelete={handleDelete} confirmMessage={confirmMessage} />;
};

export default ProfilePage;
