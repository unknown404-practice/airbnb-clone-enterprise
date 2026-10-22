import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Luggage, Calendar, MapPin, X, Star, AlertCircle, CheckCircle, Printer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TripReceiptModal from '../components/TripReceiptModal';

export default function GuestDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'

  // Review Modal state
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [subRatings, setSubRatings] = useState({
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    value: 5,
  });
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Cancellation state
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  // Receipt Modal state
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState(null);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/bookings/my-trips');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchTrips();
  }, [isAuthenticated, navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setCancelLoadingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      await fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoadingId(null);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      await api.post('/reviews', {
        listingId: selectedBookingForReview.listing._id,
        bookingId: selectedBookingForReview._id,
        rating,
        subRatings,
        comment,
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setSelectedBookingForReview(null);
        setComment('');
      }, 1500);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const now = new Date();
  const upcomingTrips = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.checkOut) >= now
  );
  const pastTrips = bookings.filter(
    (b) => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.checkOut) < now)
  );
  const cancelledTrips = bookings.filter((b) => b.status === 'cancelled');

  const currentList =
    activeTab === 'upcoming'
      ? upcomingTrips
      : activeTab === 'past'
      ? pastTrips
      : cancelledTrips;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 text-[#222222]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Trips</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your upcoming stays, view itinerary details, and share your stay reviews.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'upcoming' ? 'text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Upcoming ({upcomingTrips.length})
          {activeTab === 'upcoming' && (
            <motion.div layoutId="tripsUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'past' ? 'text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Past Stays ({pastTrips.length})
          {activeTab === 'past' && (
            <motion.div layoutId="tripsUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === 'cancelled' ? 'text-black' : 'text-gray-400 hover:text-black'
          }`}
        >
          Cancelled ({cancelledTrips.length})
          {activeTab === 'cancelled' && (
            <motion.div layoutId="tripsUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
      </div>

      {/* Trips Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
          <Luggage size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-800 text-lg">No trips found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            When you're ready to plan your next architectural getaway, we're here to help.
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 rounded-full bg-[#222222] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Start searching
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {currentList.map((trip) => {
            const checkInDate = new Date(trip.checkIn).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const checkOutDate = new Date(trip.checkOut).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-stretch rounded-3xl border border-gray-200 overflow-hidden bg-white shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Trip Listing Image */}
                <div className="sm:w-64 h-48 sm:h-auto flex-shrink-0 relative overflow-hidden bg-gray-100">
                  <img
                    src={trip.listing?.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'}
                    alt={trip.listing?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-900">
                    {trip.itineraryCode || 'ITINERARY'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="flex items-center">
                        <MapPin size={13} className="mr-1 text-[#FF385C]" />
                        {trip.listing?.location?.city}, {trip.listing?.location?.country}
                      </span>
                      <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                        {trip.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {trip.listing?.title}
                    </h3>

                    <p className="text-xs text-gray-600 flex items-center mb-3">
                      <Calendar size={14} className="mr-1.5 text-gray-400" />
                      {checkInDate} – {checkOutDate} · {trip.guestsCount} guest(s)
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-gray-500">Total Price</span>
                      <p className="text-base font-extrabold text-gray-900">${trip.totalPrice}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      {activeTab === 'upcoming' && trip.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(trip._id)}
                          disabled={cancelLoadingId === trip._id}
                          className="px-4 py-2 rounded-xl border border-gray-300 hover:border-rose-500 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          {cancelLoadingId === trip._id ? 'Cancelling...' : 'Cancel Stay'}
                        </button>
                      )}

                      {(activeTab === 'past' || trip.status === 'completed') && (
                        <button
                          onClick={() => {
                            setSelectedBookingForReview(trip);
                            setRating(5);
                            setComment('');
                          }}
                          className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-xs font-semibold text-white transition-colors flex items-center space-x-1.5"
                        >
                          <Star size={13} className="fill-white" />
                          <span>Leave a Review</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedBookingForReceipt(trip)}
                        className="px-4 py-2 rounded-xl border border-gray-300 hover:border-black text-xs font-semibold text-gray-800 flex items-center space-x-1.5 transition-colors cursor-pointer bg-white"
                      >
                        <Printer size={13} />
                        <span>Receipt</span>
                      </button>

                      <Link
                        to={`/listing/${trip.listing?._id}`}
                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition-colors"
                      >
                        View Listing
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Multi-Category Review Modal */}
      <AnimatePresence>
        {selectedBookingForReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBookingForReview(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="font-bold text-lg text-gray-900">
                  Review your stay at {selectedBookingForReview.listing?.title}
                </h3>
                <button
                  onClick={() => setSelectedBookingForReview(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              {reviewSuccess ? (
                <div className="py-8 text-center text-emerald-600 space-y-2">
                  <CheckCircle size={44} className="mx-auto" />
                  <p className="font-bold text-base">Thank you for your review!</p>
                  <p className="text-xs text-gray-500">Your feedback has been saved and listing averages updated.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {reviewError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
                      {reviewError}
                    </div>
                  )}

                  {/* Overall Star Rating */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Overall Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 text-yellow-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={28}
                            className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Multi-Category Ratings */}
                  <div className="space-y-3 bg-gray-50 p-4 rounded-2xl">
                    <span className="text-[11px] font-bold uppercase text-gray-500 block mb-1">
                      Category Sub-Ratings
                    </span>
                    {['cleanliness', 'accuracy', 'communication', 'location', 'value'].map((key) => (
                      <div key={key} className="flex items-center justify-between text-xs font-semibold capitalize text-gray-700">
                        <span>{key}</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setSubRatings((prev) => ({ ...prev, [key]: val }))}
                              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                                subRatings[key] >= val ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Written Comment */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 block mb-1">
                      Your Experience
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What made your stay special? Describe the architectural design, cleanliness, and location..."
                      className="w-full p-3 rounded-xl border border-gray-300 focus:border-black outline-none text-xs font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-full py-3 rounded-xl bg-[#222222] hover:bg-black text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Sophisticated Trip Receipt Modal */}
      <TripReceiptModal
        isOpen={Boolean(selectedBookingForReceipt)}
        onClose={() => setSelectedBookingForReceipt(null)}
        booking={selectedBookingForReceipt}
      />
    </div>
  );
}
