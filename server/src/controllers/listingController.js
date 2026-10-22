import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

// GET /api/listings
export const getListings = async (req, res, next) => {
  try {
    const {
      location,
      category,
      minPrice,
      maxPrice,
      guests,
      checkIn,
      checkOut,
      search,
      sort,
    } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Location / search text filter
    const searchTerm = location || search;
    if (searchTerm && searchTerm.trim() !== '') {
      const regex = new RegExp(searchTerm.trim(), 'i');
      query.$or = [
        { 'location.city': regex },
        { 'location.country': regex },
        { 'location.address': regex },
        { title: regex },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // Guests capacity filter
    if (guests) {
      query.maxGuests = { $gte: Number(guests) };
    }

    // Date availability filter: exclude listings that have overlapping confirmed bookings
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
        // Find conflicting bookings: (existing.checkIn < newCheckOut) AND (existing.checkOut > newCheckIn)
        const conflictingBookings = await Booking.find({
          status: 'confirmed',
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        }).select('listing');

        const conflictingListingIds = conflictingBookings.map((b) => b.listing);
        if (conflictingListingIds.length > 0) {
          query._id = { $nin: conflictingListingIds };
        }
      }
    }

    let listingsQuery = Listing.find(query).populate('host', 'name avatar email');

    // Sorting
    if (sort === 'price_asc') {
      listingsQuery = listingsQuery.sort({ pricePerNight: 1 });
    } else if (sort === 'price_desc') {
      listingsQuery = listingsQuery.sort({ pricePerNight: -1 });
    } else if (sort === 'rating') {
      listingsQuery = listingsQuery.sort({ ratingAvg: -1 });
    } else {
      listingsQuery = listingsQuery.sort({ createdAt: -1 });
    }

    const listings = await listingsQuery;

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/:id
export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('host', 'name avatar email createdAt');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Fetch reviews for this listing
    const reviews = await Review.find({ listing: listing._id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      listing,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/:id/booked-dates
export const getBookedDates = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      listing: req.params.id,
      status: 'confirmed',
      checkOut: { $gte: new Date() },
    }).select('checkIn checkOut');

    res.status(200).json({
      success: true,
      bookedDates: bookings.map((b) => ({
        checkIn: b.checkIn,
        checkOut: b.checkOut,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/listings (Host only)
export const createListing = async (req, res, next) => {
  try {
    const listingData = {
      ...req.body,
      host: req.user.id,
    };

    const listing = await Listing.create(listingData);

    res.status(201).json({
      success: true,
      listing,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/listings/:id
export const updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check ownership
    if (listing.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing',
      });
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/listings/:id
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    if (listing.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing',
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/listings/host/my-listings (Host dashboard)
export const getHostListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ host: req.user.id }).sort({ createdAt: -1 });

    // Calculate metrics for host dashboard
    const listingIds = listings.map((l) => l._id);
    const bookings = await Booking.find({
      listing: { $in: listingIds },
      status: { $in: ['confirmed', 'completed'] },
    }).populate('guest', 'name email avatar').populate('listing', 'title pricePerNight');

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalBookings = bookings.length;

    res.status(200).json({
      success: true,
      listings,
      bookings,
      stats: {
        totalListings: listings.length,
        totalBookings,
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};
