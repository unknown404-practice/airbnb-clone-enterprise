import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Menu, User as UserIcon, Heart, Luggage, Building2, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuth, switchRole } = useAuth();
  const { setIsSearchModalOpen, locationSearch, checkIn, checkOut, guests, wishlist } = useListings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleToggle = async () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    const nextRole = user.role === 'host' ? 'guest' : 'host';
    await switchRole(nextRole);
    if (nextRole === 'host') {
      navigate('/host/dashboard');
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const getSearchPillText = () => {
    const loc = locationSearch || 'Anywhere';
    const dates = checkIn && checkOut ? 'Selected dates' : 'Any week';
    const guestText = guests > 1 ? `${guests} guests` : 'Add guests';
    return { loc, dates, guestText };
  };

  const { loc, dates, guestText } = getSearchPillText();

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-all">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2 text-[#FF385C] flex-shrink-0">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 4.187 8.593 5.467 12.304 1.109 3.218 1.027 6.036-.24 8.214-1.464 2.515-3.957 3.824-7.011 3.824-2.274 0-4.32-.782-6.082-2.327C11.656 28.854 9.61 29.636 7.336 29.636c-3.054 0-5.547-1.309-7.011-3.824-1.267-2.178-1.349-4.996-.24-8.214C1.365 13.887 3.598 9.124 5.552 5.294l.533-1.025C7.373 1.963 8.828 1 10.836 1h5.164zm0 2.222h-5.164c-1.282 0-2.28.625-3.238 2.336l-.527 1.013c-1.921 3.766-4.125 8.468-5.184 11.543-.951 2.76-.879 4.957.106 6.65 1.036 1.778 2.825 2.704 5.167 2.704 2.227 0 4.249-.968 5.864-2.824l1.836-2.112 1.836 2.112c1.615 1.856 3.637 2.824 5.864 2.824 2.342 0 4.131-.926 5.167-2.704.985-1.693 1.057-3.89.106-6.65-1.059-3.075-3.263-7.777-5.184-11.543l-.527-1.013C23.444 3.847 22.446 3.222 21.164 3.222H16z" />
          </svg>
          <span className="text-xl font-extrabold tracking-tight hidden sm:inline-block">airbnb</span>
        </Link>

        {/* Morphing Search Pill */}
        <motion.div
          layoutId="search-command-bar"
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center border border-gray-200 hover:shadow-md transition-shadow duration-200 rounded-full py-2 px-4 shadow-xs bg-white cursor-pointer divide-x divide-gray-200 text-xs sm:text-sm font-semibold max-w-md w-full sm:w-auto"
        >
          <span className="px-3 text-gray-900 truncate max-w-[110px] sm:max-w-none">{loc}</span>
          <span className="px-3 text-gray-900 hidden xs:inline-block">{dates}</span>
          <div className="pl-3 pr-1 flex items-center space-x-2 text-gray-500 font-normal">
            <span className="truncate hidden md:inline-block">{guestText}</span>
            <div className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center flex-shrink-0">
              <Search size={14} strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        {/* Right Menu & User Profile */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link
            to="/wishlists"
            className="hidden md:flex items-center space-x-1.5 py-2 px-3 rounded-full text-xs font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <Heart size={16} className={wishlist.length > 0 ? "text-[#FF385C] fill-[#FF385C]" : "text-gray-700"} />
            <span>Wishlists</span>
            {wishlist.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#FF385C] text-white text-[10px] font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>

          <button
            onClick={handleRoleToggle}
            className="hidden md:block py-2 px-4 rounded-full text-xs font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
          >
            {isAuthenticated && user.role === 'host' ? 'Switch to Traveling' : 'Airbnb your home'}
          </button>

          <button
            aria-label="Language selector"
            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors hidden sm:block"
          >
            <Globe size={18} />
          </button>

          {/* User Profile Dropdown Pill */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Main user navigation menu"
              className="flex items-center space-x-3 p-1.5 pl-3 border border-gray-300 hover:shadow-md rounded-full transition-all duration-200 bg-white"
            >
              <Menu size={18} className="text-gray-700" />
              {isAuthenticated && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-500 text-white flex items-center justify-center">
                  <UserIcon size={16} />
                </div>
              )}
            </button>

            {/* Dropdown Menu Modal */}
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-sm font-medium"
              >
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 font-normal">Signed in as</p>
                      <p className="font-bold text-gray-900 truncate">{user.name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-gray-100 text-gray-700">
                        {user.role} mode
                      </span>
                    </div>

                    <Link
                      to="/wishlists"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Heart size={16} className={wishlist.length > 0 ? "text-[#FF385C] fill-[#FF385C]" : "text-gray-500"} />
                        <span>Wishlists</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#FF385C] text-xs font-bold">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/guest/trips"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
                    >
                      <Luggage size={16} className="text-gray-500" />
                      <span>My Trips</span>
                    </Link>

                    <Link
                      to="/host/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
                    >
                      <Building2 size={16} className="text-gray-500" />
                      <span>Host Dashboard</span>
                    </Link>

                    <button
                      onClick={handleRoleToggle}
                      className="w-full text-left flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors"
                    >
                      <Globe size={16} className="text-gray-500" />
                      <span>{user.role === 'host' ? 'Switch to Traveling' : 'Switch to Hosting'}</span>
                    </button>

                    <hr className="my-1 border-gray-100" />

                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 text-rose-600 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        openAuth('login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 font-bold text-gray-900 transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => {
                        openAuth('register');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Sign up
                    </button>

                    <Link
                      to="/wishlists"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Heart size={16} className={wishlist.length > 0 ? "text-[#FF385C] fill-[#FF385C]" : "text-gray-500"} />
                        <span>Wishlists</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#FF385C] text-xs font-bold">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>

                    <hr className="my-1 border-gray-100" />

                    <button
                      onClick={() => {
                        openAuth('login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-gray-600 text-xs transition-colors"
                    >
                      Quick Demo Accounts
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
