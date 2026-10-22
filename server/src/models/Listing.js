import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: 120,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    address: { type: String, default: '' },
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Please provide a price per night'],
    min: [1, 'Price must be greater than 0'],
  },
  cleaningFee: {
    type: Number,
    default: 50,
  },
  images: {
    type: [String],
    validate: [arrayLimit, 'Listing must have at least 1 image'],
    default: [],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Beachfront',
      'Cabins',
      'Luxe',
      'Trending',
      'Amazing Pools',
      'Mansions',
      'Islands',
      'Countryside',
      'Desert',
      'Lakefront',
      'Historical Homes',
      'Tiny Homes'
    ],
  },
  amenities: {
    type: [String],
    default: [],
  },
  maxGuests: {
    type: Number,
    required: true,
    default: 2,
    min: 1,
  },
  bedrooms: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  beds: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  baths: {
    type: Number,
    required: true,
    default: 1,
    min: 0.5,
  },
  ratingAvg: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: (v) => Math.round(v * 100) / 100,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

function arrayLimit(val) {
  return val.length >= 1;
}

listingSchema.index({ 'location.city': 1, 'location.country': 1 });
listingSchema.index({ category: 1 });
listingSchema.index({ pricePerNight: 1 });

export default mongoose.model('Listing', listingSchema);
