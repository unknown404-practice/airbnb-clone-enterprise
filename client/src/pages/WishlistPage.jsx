import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Map, ListFilter, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingContext';
import ListingCard from '../components/ListingCard';
import ListingMap from '../components/ListingMap';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { listings, allListings, wishlist, wishlistCount } = useListings();
  const [showMap, setShowMap] = useState(false);

  // Master catalog directory ensures wishlist shows all saved stays across all categories
  const sourceCatalog = allListings && allListings.length > 0 ? allListings : listings;
  const wishlistedListings = sourceCatalog.filter((l) => wishlist.includes(l._id));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] pb-24 md:pb-16">
      {/* Header bar */}
      <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-8 md:px-12 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C]">
                <Heart size={20} className="fill-[#FF385C]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222222] tracking-tight">
                Wishlists
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {wishlistedListings.length}{' '}
              {wishlistedListings.length === 1 ? 'saved luxury stay' : 'saved luxury stays'}
            </p>
          </div>

          {/* Map / Grid toggle if listings exist */}
          {wishlistedListings.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMap((prev) => !prev)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-900 text-xs font-semibold text-gray-800 bg-white transition-all shadow-sm"
              >
                {showMap ? (
                  <>
                    <ListFilter size={15} />
                    <span>View grid</span>
                  </>
                ) : (
                  <>
                    <Map size={15} />
                    <span>View on map</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-8 md:px-12 py-6">
        {wishlistedListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-[#FF385C] mb-6 shadow-xs">
              <Heart size={36} className="stroke-[1.75]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#222222] mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-8">
              As you search through luxury villas, beachfront retreats, and mountain chalets, tap the heart icon on any card to save your favorite stays here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#FF385C] to-[#E61E4D] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Search size={16} />
              <span>Explore stays</span>
            </Link>
          </motion.div>
        ) : showMap ? (
          <motion.div
            key="wishlist-map"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-[75vh] rounded-3xl overflow-hidden shadow-md border border-gray-200"
          >
            <ListingMap listings={wishlistedListings} />
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10"
          >
            <AnimatePresence>
              {wishlistedListings.map((listing) => (
                <motion.div
                  key={listing._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
