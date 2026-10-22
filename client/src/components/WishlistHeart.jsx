import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useListings } from '../context/ListingContext';

export default function WishlistHeart({ listingId, className = '' }) {
  const { wishlist, toggleWishlist } = useListings();
  const isLiked = wishlist.includes(listingId);
  const [isSparkling, setIsSparkling] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSparkling(true);
    toggleWishlist(listingId);
    setTimeout(() => setIsSparkling(false), 500);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
      whileTap={{ scale: 0.8 }}
      className={`relative p-2 rounded-full transition-colors hover:bg-black/10 focus:outline-none ${className}`}
    >
      <motion.div
        animate={
          isSparkling
            ? {
                scale: [1, 1.45, 0.85, 1.1, 1],
                rotate: [0, -12, 12, -6, 0],
              }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Heart
          size={22}
          className={`transition-colors duration-200 ${
            isLiked
              ? 'fill-[#FF385C] stroke-[#FF385C]'
              : 'fill-black/30 stroke-white stroke-[2.2]'
          }`}
        />
      </motion.div>

      {/* Micro particle rings when clicked */}
      {isSparkling && isLiked && (
        <motion.span
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border-2 border-[#FF385C] pointer-events-none"
        />
      )}
    </motion.button>
  );
}
