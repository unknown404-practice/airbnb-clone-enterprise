import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide an overall rating'],
    min: 1,
    max: 5,
  },
  subRatings: {
    cleanliness: { type: Number, min: 1, max: 5, default: 5 },
    accuracy: { type: Number, min: 1, max: 5, default: 5 },
    communication: { type: Number, min: 1, max: 5, default: 5 },
    location: { type: Number, min: 1, max: 5, default: 5 },
    value: { type: Number, min: 1, max: 5, default: 5 },
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate review per user per listing (or booking)
reviewSchema.index({ listing: 1, author: 1 });

export default mongoose.model('Review', reviewSchema);
