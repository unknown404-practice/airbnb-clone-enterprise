import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const ListingContext = createContext(null);

export const ListingProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [locationSearch, setLocationSearch] = useState('');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // UI state
  const [hoveredListingId, setHoveredListingId] = useState(null);
  const [viewMode, setViewMode] = useState(() => (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'split' : 'grid'));
  const [isMapVisible, setIsMapVisible] = useState(() => (typeof window !== 'undefined' && window.innerWidth >= 1024));
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('airbnb_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (listingId) => {
    setWishlist((prev) => {
      const next = prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId];
      localStorage.setItem('airbnb_wishlist', JSON.stringify(next));
      return next;
    });
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};

      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (locationSearch.trim()) {
        params.location = locationSearch.trim();
      }
      if (checkIn) {
        params.checkIn = checkIn instanceof Date ? checkIn.toISOString() : checkIn;
      }
      if (checkOut) {
        params.checkOut = checkOut instanceof Date ? checkOut.toISOString() : checkOut;
      }
      if (guests > 1) {
        params.guests = guests;
      }
      if (priceRange[0] > 0) {
        params.minPrice = priceRange[0];
      }
      if (priceRange[1] < 2000) {
        params.maxPrice = priceRange[1];
      }

      const res = await api.get('/listings', { params });
      let data = res.data.listings || [];

      // Filter by selected amenities on the client if specified
      if (selectedAmenities.length > 0) {
        data = data.filter((item) =>
          selectedAmenities.every((amenity) => item.amenities && item.amenities.includes(amenity))
        );
      }

      setListings(data);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, locationSearch, checkIn, checkOut, guests, priceRange, selectedAmenities]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setLocationSearch('');
    setCheckIn(null);
    setCheckOut(null);
    setGuests(1);
    setPriceRange([0, 2000]);
    setSelectedAmenities([]);
  };

  return (
    <ListingContext.Provider
      value={{
        listings,
        loading,
        error,
        selectedCategory,
        setSelectedCategory,
        locationSearch,
        setLocationSearch,
        checkIn,
        setCheckIn,
        checkOut,
        setCheckOut,
        guests,
        setGuests,
        priceRange,
        setPriceRange,
        selectedAmenities,
        setSelectedAmenities,
        hoveredListingId,
        setHoveredListingId,
        viewMode,
        setViewMode,
        isMapVisible,
        setIsMapVisible,
        isFilterModalOpen,
        setIsFilterModalOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        wishlist,
        toggleWishlist,
        fetchListings,
        resetFilters,
      }}
    >
      {children}
    </ListingContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingProvider');
  }
  return context;
};
