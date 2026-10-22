import React from 'react';
import { Compass, Heart, Luggage, User as UserIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';

export default function Footer() {
  const location = useLocation();
  const { isAuthenticated, user, openAuth } = useAuth();
  const { wishlist } = useListings();

  return (
    <>
      {/* Desktop Footer */}
      <footer className="mt-20 border-t border-gray-200 bg-[#F7F7F7] text-xs text-[#717171] py-8 hidden md:block">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span>© 2026 Airbnb, Inc. · Capstone Architecture Project</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>
          <div className="flex items-center space-x-6 font-semibold text-[#222222]">
            <span className="cursor-pointer hover:underline">English (US)</span>
            <span className="cursor-pointer hover:underline">$ USD</span>
            <span className="text-[#FF385C] font-bold">1st Place Architecture</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Module 5 requirement) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-2 px-6 flex md:hidden items-center justify-around shadow-lg">
        <Link
          to="/"
          className={`flex flex-col items-center space-y-1 text-[11px] font-semibold ${
            location.pathname === '/' ? 'text-[#FF385C]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Compass size={22} />
          <span>Explore</span>
        </Link>

        <Link
          to="/wishlists"
          className={`relative flex flex-col items-center space-y-1 text-[11px] font-semibold transition-colors ${
            location.pathname === '/wishlists' ? 'text-[#FF385C]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Heart size={22} className={location.pathname === '/wishlists' ? 'fill-[#FF385C]' : ''} />
          <span>Wishlists</span>
          {wishlist.length > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 bg-[#FF385C] text-white rounded-full text-[9px] flex items-center justify-center font-bold shadow-xs">
              {wishlist.length}
            </span>
          )}
        </Link>

        <Link
          to={isAuthenticated ? '/guest/trips' : '#'}
          onClick={(e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              openAuth('login');
            }
          }}
          className={`flex flex-col items-center space-y-1 text-[11px] font-semibold ${
            location.pathname.startsWith('/guest') ? 'text-[#FF385C]' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Luggage size={22} />
          <span>Trips</span>
        </Link>

        <button
          onClick={() => {
            if (isAuthenticated) {
              if (user.role === 'host') {
                // navigate
              }
            } else {
              openAuth('login');
            }
          }}
          className="flex flex-col items-center space-y-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900"
        >
          <UserIcon size={22} />
          <span>{isAuthenticated ? user.name.split(' ')[0] : 'Log in'}</span>
        </button>
      </nav>
    </>
  );
}
