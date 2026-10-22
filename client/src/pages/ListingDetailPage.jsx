import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Star,
  Share2,
  Heart,
  MapPin,
  Sparkles,
  ShieldCheck,
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Printer,
  Users,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingContext';
import WishlistHeart from '../components/WishlistHeart';
import ListingMap from '../components/ListingMap';
import TripReceiptModal from '../components/TripReceiptModal';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuth } = useAuth();
  const { wishlist, toggleWishlist } = useListings();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery Lightbox Modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Booking Card state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Booking Confirmation Modal state
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    const fetchListingData = async () => {
      setLoading(true);
      try {
        const [listingRes, bookedRes] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/listings/${id}/booked-dates`),
        ]);

        setListing(listingRes.data.listing);
        setReviews(listingRes.data.reviews || []);
        setBookedDates(bookedRes.data.bookedDates || []);
      } catch (err) {
        console.error('Failed to load listing details:', err);
        setError(err.response?.data?.message || 'Listing not found');
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [id]);

  // Check if a date string is already booked
  const isDateBooked = (dateStr) => {
    if (!dateStr) return false;
    const target = new Date(dateStr).getTime();
    return bookedDates.some((b) => {
      const start = new Date(b.checkIn).getTime();
      const end = new Date(b.checkOut).getTime();
      return target >= start && target < end;
    });
  };

  // Pricing calculation
  const calculatePricing = () => {
    if (!checkIn || !checkOut || !listing) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) return null;

    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return null;

    const nightlyBase = listing.pricePerNight * diffDays;
    const cleaning = listing.cleaningFee || 50;
    const serviceFee = Math.round(nightlyBase * 0.14);
    const total = nightlyBase + cleaning + serviceFee;

    return { diffDays, nightlyBase, cleaning, serviceFee, total };
  };

  const pricing = calculatePricing();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingError('Please select valid check-in and check-out dates.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/bookings', {
        listingId: listing._id,
        checkIn,
        checkOut,
        guestsCount,
      });

      setConfirmedBooking(res.data.booking);
      setIsConfirmationOpen(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF385C', '#E61E4D', '#008489', '#FFB400'],
      });

      // Refresh booked dates
      const bookedRes = await api.get(`/listings/${id}/booked-dates`);
      setBookedDates(bookedRes.data.bookedDates || []);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Unable to complete reservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-2/3 mb-4 animate-shimmer" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8 animate-shimmer" />
        <div className="grid grid-cols-4 gap-2 h-96 rounded-3xl overflow-hidden mb-8 animate-shimmer" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not available</h2>
        <p className="text-gray-500 mb-6">{error || "The requested listing could not be found."}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-full bg-[#222222] text-white font-semibold text-sm hover:bg-black"
        >
          Return to home
        </button>
      </div>
    );
  }

  const images = listing.images && listing.images.length >= 5
    ? listing.images
    : [
        listing.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 text-[#222222]">
      {/* Listing Title & Actions Header */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#222222] mb-2">
          {listing.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between text-sm text-[#717171] gap-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 font-semibold text-[#222222]">
              <Star size={15} className="fill-black text-black" />
              <span>{listing.ratingAvg > 0 ? listing.ratingAvg.toFixed(2) : 'New'}</span>
            </div>
            <span>·</span>
            <span className="underline font-medium text-[#222222] cursor-pointer">
              {listing.reviewCount} reviews
            </span>
            <span>·</span>
            <span className="flex items-center font-medium">
              <MapPin size={14} className="mr-1 text-gray-500" />
              {listing.location.city}, {listing.location.country}
            </span>
          </div>

          <div className="flex items-center space-x-4 font-semibold text-xs text-[#222222]">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: listing.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center space-x-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Share2 size={16} />
              <span className="underline">Share</span>
            </button>
            <button
              onClick={() => toggleWishlist(listing._id)}
              className="flex items-center space-x-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Heart
                size={16}
                className={wishlist.includes(listing._id) ? 'fill-[#FF385C] stroke-[#FF385C]' : ''}
              />
              <span className="underline">Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Photo Architectural Bento Gallery */}
      <div className="relative rounded-3xl overflow-hidden mb-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[350px] sm:h-[460px]">
          {/* Main Hero Photo (Spans 2 cols, 2 rows) */}
          <div
            onClick={() => {
              setActivePhotoIndex(0);
              setIsLightboxOpen(true);
            }}
            className="md:col-span-2 md:row-span-2 relative cursor-pointer group overflow-hidden"
          >
            <img
              src={images[0]}
              alt="Main listing view"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80';
              }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          {/* 4 Supporting Photos */}
          {images.slice(1, 5).map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActivePhotoIndex(idx + 1);
                setIsLightboxOpen(true);
              }}
              className="hidden md:block relative cursor-pointer group overflow-hidden"
            >
              <img
                src={imgUrl}
                alt={`Photo ${idx + 2}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80';
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            </div>
          ))}
        </div>

        {/* "Show all photos" floating button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-gray-900 border border-gray-200 shadow-md hover:bg-white transition-all flex items-center space-x-1.5"
        >
          <span>Show all {images.length} photos</span>
        </button>
      </div>

      {/* 2-Column Split: Content & Sticky Reserve Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        {/* Left Column: Details, Amenities, Host info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Room stats & Host Info */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Entire villa hosted by {listing.host?.name || 'Superhost'}
              </h2>
              <p className="text-sm text-gray-500">
                {listing.maxGuests} guests · {listing.bedrooms} bedroom{listing.bedrooms > 1 ? 's' : ''} · {listing.beds} bed{listing.beds > 1 ? 's' : ''} · {listing.baths} bath{listing.baths > 1 ? 's' : ''}
              </p>
            </div>
            {listing.host?.avatar && (
              <img
                src={listing.host.avatar}
                alt={listing.host.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
              />
            )}
          </div>

          {/* Highlights */}
          <div className="space-y-4 pb-6 border-b border-gray-200">
            <div className="flex items-start space-x-4">
              <Sparkles className="text-[#FF385C] flex-shrink-0 mt-0.5" size={22} />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Bespoke Architecture</h4>
                <p className="text-xs text-gray-500">Award-winning luxury residence curated for serenity and nature integration.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <ShieldCheck className="text-[#FF385C] flex-shrink-0 mt-0.5" size={22} />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Dedicated Superhost</h4>
                <p className="text-xs text-gray-500">Experienced, highly rated hosts committed to providing great stays for guests.</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">About this space</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-3">
              {listing.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#FF385C]" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Reserve Card */}
        <div className="relative">
          <div className="sticky top-28 bg-white rounded-3xl p-6 border border-gray-200 shadow-xl transition-shadow">
            <div className="flex items-baseline justify-between mb-4">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-gray-900">${listing.pricePerNight}</span>
                <span className="text-xs text-gray-500 font-normal">night</span>
              </div>
              <div className="flex items-center space-x-1 text-xs font-semibold">
                <Star size={13} className="fill-black" />
                <span>{listing.ratingAvg > 0 ? listing.ratingAvg.toFixed(2) : 'New'}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 font-normal">{listing.reviewCount} reviews</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-black">
                <div className="grid grid-cols-2 divide-x divide-gray-300 border-b border-gray-300">
                  <div className="p-3 bg-gray-50/50">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                      Check-in
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-transparent font-medium text-xs text-gray-900 outline-none"
                    />
                  </div>
                  <div className="p-3 bg-gray-50/50">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                      Checkout
                    </label>
                    <input
                      type="date"
                      required
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent font-medium text-xs text-gray-900 outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white">
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                    Guests
                  </label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full bg-transparent font-medium text-xs text-gray-900 outline-none cursor-pointer"
                  >
                    {Array.from({ length: listing.maxGuests || 4 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} guest{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {bookingError}
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF385C] to-[#E61E4D] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 hover:shadow-lg active:scale-[0.99]"
              >
                {bookingLoading ? 'Securing reservation...' : 'Reserve'}
              </button>

              <p className="text-center text-xs text-gray-400">You won't be charged yet</p>

              {/* Animated Price Odometer Breakdown */}
              <AnimatePresence>
                {pricing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="overflow-hidden pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-700"
                  >
                    <div className="flex justify-between">
                      <span className="underline">
                        ${listing.pricePerNight} × {pricing.diffDays} nights
                      </span>
                      <span>${pricing.nightlyBase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Cleaning fee</span>
                      <span>${pricing.cleaning}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="underline">Airbnb service fee (14%)</span>
                      <span>${pricing.serviceFee}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                      <span>Total before taxes</span>
                      <span>${pricing.total}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>

      {/* Reviews Section with Category Breakdown */}
      <div className="mt-16 pt-12 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-8">
          <Star size={20} className="fill-black" />
          <h2 className="text-2xl font-bold text-gray-900">
            {listing.ratingAvg > 0 ? listing.ratingAvg.toFixed(2) : 'No reviews yet'} · {reviews.length} reviews
          </h2>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 max-w-4xl mb-12">
          {['Cleanliness', 'Accuracy', 'Communication', 'Location', 'Value'].map((cat) => (
            <div key={cat} className="flex items-center justify-between text-xs font-semibold text-gray-800">
              <span className="w-32">{cat}</span>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '96%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-black rounded-full"
                />
              </div>
              <span className="w-6 text-right">4.9</span>
            </div>
          ))}
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((rev) => (
            <div key={rev._id} className="space-y-2.5">
              <div className="flex items-center space-x-3">
                <img
                  src={rev.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={rev.author?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{rev.author?.name}</h4>
                  <p className="text-xs text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Where You'll Be (Location Map) */}
      <div className="mt-16 pt-12 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Where you'll be</h3>
        <p className="text-sm text-gray-600 mb-6">
          {listing.location.city}, {listing.location.country}
          {listing.location.address ? ` · ${listing.location.address}` : ''}
        </p>
        <div className="w-full h-[450px] rounded-3xl overflow-hidden shadow-md border border-gray-200">
          <ListingMap listings={[listing]} />
        </div>
      </div>

      {/* Lightbox Full-Screen Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8"
          >
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-semibold">
                {activePhotoIndex + 1} / {images.length}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close photo gallery"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full my-4">
              <motion.img
                key={activePhotoIndex}
                src={images[activePhotoIndex]}
                alt="Enlarged view"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80';
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                    className="absolute left-2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setActivePhotoIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                    className="absolute right-2 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            <div className="text-center text-xs text-gray-400">
              {listing.title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebratory Booking Confirmation Drawer / Modal */}
      <AnimatePresence>
        {isConfirmationOpen && confirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmationOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Checkmark animation */}
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 size={40} />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1">Reservation Confirmed!</h3>
                <p className="text-xs text-gray-500 mb-6">
                  You're all set for an unforgettable architectural escape.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 mb-6 text-xs text-gray-700">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="font-bold text-gray-900">Itinerary Code</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-300 font-bold text-black">
                    {confirmedBooking.itineraryCode || 'HM-CONFIRMED'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Destination</span>
                  <span className="font-semibold text-gray-900">{listing.location.city}, {listing.location.country}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Dates</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(confirmedBooking.checkIn).toLocaleDateString()} – {new Date(confirmedBooking.checkOut).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Guests</span>
                  <span className="font-semibold text-gray-900">{confirmedBooking.guestsCount} Guest(s)</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-sm text-gray-900">
                  <span>Total Paid</span>
                  <span className="text-[#FF385C]">${confirmedBooking.totalPrice}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(true)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 hover:border-black font-semibold text-xs text-gray-800 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Printer size={15} />
                  <span>View & Print Official Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/guest/trips')}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#222222] hover:bg-black font-semibold text-xs text-white transition-colors cursor-pointer"
                >
                  Go to Trips
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sophisticated Official Trip Receipt Modal */}
      <TripReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        booking={confirmedBooking}
        listing={listing}
      />
    </div>
  );
}
