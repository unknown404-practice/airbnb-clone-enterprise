import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';

// POST /api/reviews
export const createReview = async (req, res, next) => {
  try {
    const { listingId, rating, subRatings, comment, bookingId } = req.body;

    if (!listingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide listingId, overall rating, and review comment',
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Check if user already reviewed this listing
    const existingReview = await Review.findOne({
      listing: listingId,
      author: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this listing',
      });
    }

    const review = await Review.create({
      listing: listingId,
      booking: bookingId || undefined,
      author: req.user.id,
      rating: Number(rating),
      subRatings: subRatings || {
        cleanliness: Number(rating),
        accuracy: Number(rating),
        communication: Number(rating),
        location: Number(rating),
        value: Number(rating),
      },
      comment,
    });

    // Recalculate listing ratingAvg and reviewCount atomically via MongoDB Aggregation Pipeline
    const stats = await Review.aggregate([
      { $match: { listing: new mongoose.Types.ObjectId(listingId) } },
      {
        $group: {
          _id: '$listing',
          ratingAvg: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const count = stats.length > 0 ? stats[0].reviewCount : 0;
    const avg = stats.length > 0 ? Math.round(stats[0].ratingAvg * 100) / 100 : 0;

    listing.reviewCount = count;
    listing.ratingAvg = avg;
    await listing.save();

    const populatedReview = await Review.findById(review._id).populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      review: populatedReview,
      updatedListingStats: {
        ratingAvg: listing.ratingAvg,
        reviewCount: listing.reviewCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews/listing/:listingId
export const getListingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    // Compute category breakdown averages
    let breakdown = {
      cleanliness: 5,
      accuracy: 5,
      communication: 5,
      location: 5,
      value: 5,
    };

    if (reviews.length > 0) {
      breakdown = {
        cleanliness: Number((reviews.reduce((s, r) => s + (r.subRatings?.cleanliness || 5), 0) / reviews.length).toFixed(1)),
        accuracy: Number((reviews.reduce((s, r) => s + (r.subRatings?.accuracy || 5), 0) / reviews.length).toFixed(1)),
        communication: Number((reviews.reduce((s, r) => s + (r.subRatings?.communication || 5), 0) / reviews.length).toFixed(1)),
        location: Number((reviews.reduce((s, r) => s + (r.subRatings?.location || 5), 0) / reviews.length).toFixed(1)),
        value: Number((reviews.reduce((s, r) => s + (r.subRatings?.value || 5), 0) / reviews.length).toFixed(1)),
      };
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      breakdown,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};
