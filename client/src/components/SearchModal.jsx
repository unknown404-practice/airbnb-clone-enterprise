import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, X, Minus, Plus } from 'lucide-react';
import { useListings } from '../context/ListingContext';

const popularDestinations = [
  { city: 'Malibu', country: 'United States', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80' },
  { city: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=200&q=80' },
  { city: 'Zermatt', country: 'Switzerland', image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=200&q=80' },
  { city: 'Oia', country: 'Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=200&q=80' },
  { city: 'Ubud', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=200&q=80' },
  { city: 'Positano', country: 'Italy', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=200&q=80' },
];

export default function SearchModal({ isOpen, onClose }) {
  const {
    locationSearch,
    setLocationSearch,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    fetchListings,
  } = useListings();

  const [activeTab, setActiveTab] = useState('where'); // 'where', 'dates', 'guests'

  if (!isOpen) return null;

  const handleSearch = () => {
    fetchListings();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Container */}
        <div className="min-h-full flex items-start justify-center pt-20 pb-12 px-4 sm:px-6">
          <motion.div
            layoutId="search-command-bar"
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              aria-label="Close search modal"
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header Tabs */}
            <div className="flex justify-center space-x-8 pt-6 pb-4 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('where')}
                className={`text-sm font-semibold transition-colors pb-2 relative ${
                  activeTab === 'where' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                Where
                {activeTab === 'where' && (
                  <motion.div
                    layoutId="activeSearchTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('dates')}
                className={`text-sm font-semibold transition-colors pb-2 relative ${
                  activeTab === 'dates' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                Dates
                {activeTab === 'dates' && (
                  <motion.div
                    layoutId="activeSearchTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('guests')}
                className={`text-sm font-semibold transition-colors pb-2 relative ${
                  activeTab === 'guests' ? 'text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                Who
                {activeTab === 'guests' && (
                  <motion.div
                    layoutId="activeSearchTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  />
                )}
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 sm:p-8">
              {activeTab === 'where' && (
                <div>
                  <div className="relative mb-6">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Search destinations (e.g., Malibu, Kyoto, Zermatt)..."
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none text-base font-medium"
                      autoFocus
                    />
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                    Search by region or popular spot
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {popularDestinations.map((dest) => (
                      <div
                        key={dest.city}
                        onClick={() => {
                          setLocationSearch(dest.city);
                          setActiveTab('dates');
                        }}
                        className="cursor-pointer group flex items-center space-x-3 p-2.5 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all"
                      >
                        <img
                          src={dest.image}
                          alt={dest.city}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-black">{dest.city}</p>
                          <p className="text-xs text-gray-500">{dest.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'dates' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50">
                      <label className="text-xs font-bold uppercase text-gray-500 block mb-1">
                        Check-in
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={checkIn ? new Date(checkIn).toISOString().split('T')[0] : ''}
                        onChange={(e) => setCheckIn(e.target.value ? new Date(e.target.value) : null)}
                        className="w-full bg-transparent font-medium text-sm text-gray-800 outline-none"
                      />
                    </div>
                    <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50">
                      <label className="text-xs font-bold uppercase text-gray-500 block mb-1">
                        Check-out
                      </label>
                      <input
                        type="date"
                        min={
                          checkIn
                            ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
                            : new Date().toISOString().split('T')[0]
                        }
                        value={checkOut ? new Date(checkOut).toISOString().split('T')[0] : ''}
                        onChange={(e) => setCheckOut(e.target.value ? new Date(e.target.value) : null)}
                        className="w-full bg-transparent font-medium text-sm text-gray-800 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveTab('guests')}
                      className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-800 transition-colors"
                    >
                      Next: Guests
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'guests' && (
                <div className="py-2">
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                      <h5 className="font-semibold text-gray-900">Total Guests</h5>
                      <p className="text-xs text-gray-500">Ages 13 or above</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        disabled={guests <= 1}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black disabled:opacity-40 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-semibold text-base w-6 text-center">{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.min(16, g + 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setLocationSearch('');
                  setCheckIn(null);
                  setCheckOut(null);
                  setGuests(1);
                }}
                className="text-xs font-semibold text-gray-700 underline hover:text-black"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#FF385C] to-[#E61E4D] hover:opacity-95 text-white font-semibold text-sm shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
