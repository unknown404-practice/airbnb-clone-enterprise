import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ListingProvider } from './context/ListingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

const HomePage = lazy(() => import('./pages/HomePage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const GuestDashboardPage = lazy(() => import('./pages/GuestDashboardPage'));
const HostDashboardPage = lazy(() => import('./pages/HostDashboardPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageFallbackLoader() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-3 border-gray-200 border-t-[#FF385C] rounded-full animate-spin mb-3" />
      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 animate-pulse">
        Loading Airbnb Stays...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ListingProvider>
          <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#222222]">
            <Navbar />
            <div className="flex-1">
              <Suspense fallback={<PageFallbackLoader />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/listing/:id" element={<ListingDetailPage />} />
                  <Route path="/wishlists" element={<WishlistPage />} />
                  <Route path="/guest/trips" element={<GuestDashboardPage />} />
                  <Route path="/host/dashboard" element={<HostDashboardPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </div>
            <Footer />
            <AuthModal />
          </div>
        </ListingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
