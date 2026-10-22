import React from 'react';
import { motion } from 'framer-motion';
import { SearchX, RotateCcw } from 'lucide-react';
import ListingCard from './ListingCard';
import SkeletonCard from './SkeletonCard';
import { useListings } from '../context/ListingContext';

export default function ListingGrid({ isSplitView = false }) {
  const { listings, loading, resetFilters, viewMode } = useListings();

  const isSplit = isSplitView || viewMode === 'split';

  const gridClass = isSplit
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-8 pt-2"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 pt-4";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 px-4 text-center"
      >
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-[#FF385C] mb-5">
          <SearchX size={36} />
        </div>
        <h3 className="text-xl font-semibold text-[#222222] mb-2">No listings found</h3>
        <p className="text-[#717171] max-w-md mb-6 text-sm leading-relaxed">
          Try adjusting your search criteria, removing date filters, or expanding your price range to discover world-class stays.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={resetFilters}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#222222] text-white text-sm font-semibold hover:bg-black transition-colors shadow-sm"
        >
          <RotateCcw size={16} />
          <span>Reset all filters</span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={gridClass}
    >
      {listings.map((listing) => (
        <ListingCard key={listing._id} listing={listing} />
      ))}
    </motion.div>
  );
}
