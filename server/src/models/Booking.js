import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  checkIn: {
    type: Date,
    required: [true, 'Please provide a check-in date'],
  },
  checkOut: {
    type: Date,
    required: [true, 'Please provide a check-out date'],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  nightlyRate: {
    type: Number,
    default: 0,
  },
  cleaningFee: {
    type: Number,
    default: 0,
  },
  serviceFee: {
    type: Number,
    default: 0,
  },
  guestsCount: {
    type: Number,
    required: true,
    default: 1,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  itineraryCode: {
    type: String,
    default: () => 'HM' + Math.random().toString(36).substring(2, 9).toUpperCase(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.index({ listing: 1, status: 1, checkIn: 1, checkOut: 1 });

export default mongoose.model('Booking', bookingSchema);
