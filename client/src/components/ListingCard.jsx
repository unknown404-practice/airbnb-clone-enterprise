import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WishlistHeart from './WishlistHeart';
import { useListings } from '../context/ListingContext';

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const { setHoveredListingId } = useListings();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onMouseEnter={() => {
        setIsHovered(true);
        setHoveredListingId(listing._id);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredListingId(null);
      }}
      onClick={() => navigate(`/listing/${listing._id}`)}
      className="group cursor-pointer flex flex-col select-none"
    >
      {/* Image Carousel Container */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        <motion.img
          key={currentImageIndex}
          src={images[currentImageIndex]}
          alt={listing.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
          }}
          animate={{ scale: isHovered ? 1.04 : 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />

        {/* Wishlist Heart Icon */}
        <div className="absolute top-3 right-3 z-20">
          <WishlistHeart listingId={listing._id} />
        </div>

        {/* Guest Favorite / Category Badge */}
        {listing.ratingAvg >= 4.9 && (
          <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-[#222222] shadow-sm">
            Guest favourite
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {images.length > 1 && isHovered && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md hover:scale-105 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md hover:scale-105 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 z-20 flex justify-center space-x-1.5">
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex
                    ? 'w-4 bg-white'
                    : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Listing Meta Details */}
      <div className="mt-3 flex flex-col space-y-0.5">
        <div className="flex items-center justify-between text-sm font-semibold text-[#222222]">
          <span className="truncate pr-2 font-medium">
            {listing.location.city}, {listing.location.country}
          </span>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star size={13} className="fill-[#222222] text-[#222222]" />
            <span>{listing.ratingAvg > 0 ? listing.ratingAvg.toFixed(2) : 'New'}</span>
          </div>
        </div>

        <p className="text-xs text-[#717171] truncate">{listing.title}</p>
        <p className="text-xs text-[#717171]">
          {listing.category} · {listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''}
        </p>

        <div className="pt-1 flex items-baseline space-x-1 text-sm">
          <span className="font-semibold text-[#222222]">${listing.pricePerNight}</span>
          <span className="text-xs text-[#717171]">night</span>
        </div>
      </div>
    </motion.div>
  );
}
