import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// eslint-disable-next-line no-unused-vars
import Header from './components/Header';
// eslint-disable-next-line no-unused-vars
import Sidebar from './components/Sidebar';
// eslint-disable-next-line no-unused-vars
import { AuthProvider } from './context/AuthContext';

// AI-OPTIMIZED: Font optimization with display swap
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // AI-OPTIMIZED: Better font loading performance
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // AI-OPTIMIZED: Better font loading performance
});

// AI-OPTIMIZED: Enhanced metadata for better SEO and performance
export const metadata = {
  title: 'ApartmentsFlow - Smart Apartment Search',
  description:
    'Search, compare, and organize apartment listings with built-in tools for exploring neighborhoods, tracking favorites, and planning your daily commute.',
  keywords: 'apartments, rental, housing, search, real estate',
  authors: [{ name: 'ApartmentsFlow Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ApartmentsFlow - Smart Apartment Search',
    description: 'Your smart apartment search organizer',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApartmentsFlow - Smart Apartment Search',
    description: 'Your smart apartment search organizer',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* AI-OPTIMIZED: DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//localhost" />

        {/* AI-OPTIMIZED: Performance monitoring */}
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
