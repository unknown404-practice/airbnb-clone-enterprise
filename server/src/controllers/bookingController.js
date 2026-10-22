import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';

// POST /api/bookings
export const createBooking = async (req, res, next) => {
  let session = null;
  let useTransaction = false;

  // Check if MongoDB deployment supports replica-set ACID transactions (Atlas / ReplicaSet)
  const topologyType = mongoose.connection.client?.topology?.description?.type;
  const supportsTransactions = topologyType && topologyType !== 'Single';

  if (supportsTransactions) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch (sessErr) {
      if (session) {
        await session.endSession().catch(() => {});
        session = null;
      }
      useTransaction = false;
    }
  }

  try {
    const { listingId, checkIn, checkOut, guestsCount } = req.body;

    if (!listingId || !checkIn || !checkOut) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Please provide listing ID, check-in date, and check-out date',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date format',
      });
    }

    if (checkInDate >= checkOutDate) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after check-in date',
      });
    }

    // Minimum check-in can't be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past',
      });
    }

    const listingQuery = Listing.findById(listingId);
    if (useTransaction && session) listingQuery.session(session);
    const listing = await listingQuery;

    if (!listing) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Prevent host from booking their own listing
    if (listing.host.toString() === req.user.id) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own listing',
      });
    }

    // Validate guest capacity
    const numGuests = Number(guestsCount) || 1;
    if (numGuests > listing.maxGuests) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Maximum allowed guests for this listing is ${listing.maxGuests}`,
      });
    }

    // CRITICAL: Database-level overlap validation inside transaction / session
    // Confirmed booking where: (existing.checkIn < newCheckOut) AND (existing.checkOut > newCheckIn)
    const conflictQuery = Booking.findOne({
      listing: listingId,
      status: 'confirmed',
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });
    if (useTransaction && session) conflictQuery.session(session);
    const existingConflict = await conflictQuery;

    if (existingConflict) {
      if (useTransaction && session) await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'Selected dates overlap with an existing booking. Please select different dates.',
        conflictingBooking: {
          checkIn: existingConflict.checkIn,
          checkOut: existingConflict.checkOut,
        },
      });
    }

    // Calculate nights & pricing breakdown
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const basePrice = listing.pricePerNight * nights;
    const cleaningFee = listing.cleaningFee || 50;
    const serviceFee = Math.round(basePrice * 0.14); // 14% Airbnb service fee
    const totalPrice = basePrice + cleaningFee + serviceFee;

    const bookingPayload = {
      listing: listingId,
      guest: req.user.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      nightlyRate: listing.pricePerNight,
      cleaningFee,
      serviceFee,
      guestsCount: numGuests,
      status: 'confirmed',
    };

    let booking;
    if (useTransaction && session) {
      const createdArray = await Booking.create([bookingPayload], { session });
      booking = createdArray[0];
      await session.commitTransaction();
    } else {
      booking = await Booking.create(bookingPayload);
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('listing', 'title location images pricePerNight cleaningFee')
      .populate('guest', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking,
      breakdown: {
        nights,
        nightlyRate: listing.pricePerNight,
        basePrice,
        cleaningFee,
        serviceFee,
        totalPrice,
      },
    });
  } catch (err) {
    if (useTransaction && session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // ignore abort errors
      }
    }
    next(err);
  } finally {
    if (session) {
      await session.endSession().catch(() => {});
    }
  }
};

// GET /api/bookings/my-trips
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.user.id })
      .populate({
        path: 'listing',
        select: 'title location images pricePerNight category host',
        populate: { path: 'host', select: 'name avatar' },
      })
      .sort({ checkIn: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('guest', 'name email avatar');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Only guest or host of the listing can view
    const isGuest = booking.guest._id.toString() === req.user.id;
    const isHost = booking.listing.host.toString() === req.user.id;

    if (!isGuest && !isHost && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/cancel
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.guest.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (err) {
    next(err);
  }
};
