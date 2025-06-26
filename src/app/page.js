'use client';
// eslint-disable-next-line no-unused-vars
import Link from 'next/link';
import { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

// AI-OPTIMIZED: Home page component with performance monitoring
export default function Home() {
  // AI-OPTIMIZED: Performance monitoring temporarily disabled for debugging

  return (
    <ErrorBoundary>
      <div
        style={{
          backgroundImage: "url('/background2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100%',
          width: '100%',
        }}
        className="min-h-screen bg-gradient-to-b from-white to-gray-50"
      >
        <div className="max-w-6xl mx-auto min-h-screen px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center bg-white/50 rounded-md">
          <h1 className="text-4xl md:text-6xl font-bold m-10">Welcome to ApartmentsFlow!</h1>
          <h2 className="text-2xl md:text-4xl font-bold m-10">
            Your smart apartment search organiser
          </h2>
          <p className="text-xl md:text-2xl">
            <span className="font-bold">ApartmentsFlow</span> helps you search, compare, and
            organize apartment listings with built-in tools for exploring neighborhoods, tracking
            favorites, and planning your daily commute.
          </p>
          <p className="text-xl md:text-2xl">
            Start your search today and make apartment hunting stress-free.
          </p>
          <p className="text-xl md:text-2xl font-bold mt-20 text-[var(--color-secondary)]">
            <Link
              href="/auth/register"
              className="hover:text-[var(--color-accent)] transition-colors duration-200"
            >
              Sign up
            </Link>{' '}
            to save listings.
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
}
