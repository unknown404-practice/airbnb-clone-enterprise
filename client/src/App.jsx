import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ListingProvider } from './context/ListingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import GuestDashboardPage from './pages/GuestDashboardPage';
import HostDashboardPage from './pages/HostDashboardPage';
import WishlistPage from './pages/WishlistPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ListingProvider>
          <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#222222]">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/listing/:id" element={<ListingDetailPage />} />
                <Route path="/wishlists" element={<WishlistPage />} />
                <Route path="/guest/trips" element={<GuestDashboardPage />} />
                <Route path="/host/dashboard" element={<HostDashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
            <Footer />
            <AuthModal />
          </div>
        </ListingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
