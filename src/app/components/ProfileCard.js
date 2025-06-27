'use client';
// eslint-disable-next-line no-unused-vars
import Link from 'next/link';
// eslint-disable-next-line no-unused-vars
import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { useAuth } from '../context/AuthContext';

const ProfileCard = ({ user }) => {
  // Handle null or undefined user
  if (!user) {
    return (
      <div>
        <img src="/default-avatar.png" alt="Avatar" className="w-30 h-30 rounded-full" />
        <p className="font-bold m-2">Name: Not available</p>
        <p className="font-bold m-2">Email: Not available</p>
        <Link
          href="/profile/edit"
          className="inline-block px-4 py-2 text-white bg-[var(--color-secondary)] rounded hover:bg-[var(--color-primary)] transition-colors duration-20"
        >
          Edit Profile
        </Link>
      </div>
    );
  }

  return (
    <div>
      <img
        src={user.profileImage || user.avatar || '/default-avatar.png'}
        alt="Avatar"
        className="w-32 h-32 rounded-full object-cover"
      />
      <p className="font-bold m-2">Name: {user.name}</p>
      <p className="font-bold m-2">Email: {user.email}</p>
      <Link
        href="/profile/edit"
        className="inline-block px-4 py-2 text-white bg-[var(--color-secondary)] rounded hover:bg-[var(--color-primary)] transition-colors duration-20"
      >
        Edit Profile
      </Link>
    </div>
  );
};

export default ProfileCard;
