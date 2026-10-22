import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { usersData, listingsData } from './seedData.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Starting database seed process...');
    await connectDB();

    // Clear existing records
    await Review.deleteMany({});
    await Booking.deleteMany({});
    await Listing.deleteMany({});
    await User.deleteMany({});
    console.log('[Seeder] Purged old collections.');

    // Create users
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`[Seeder] Created ${createdUsers.length} users (Hosts: Elena, Marcus; Guests: Sophia, Julian).`);

    const host1 = createdUsers[0]; // Elena
    const host2 = createdUsers[1]; // Marcus
    const guest1 = createdUsers[2]; // Sophia
    const guest2 = createdUsers[3]; // Julian

    // Create listings (alternating between host1 and host2)
    const createdListings = [];
    for (let i = 0; i < listingsData.length; i++) {
      const listingPayload = {
        ...listingsData[i],
        host: i % 2 === 0 ? host1._id : host2._id,
      };
      const listing = await Listing.create(listingPayload);
      createdListings.push(listing);
    }
    console.log(`[Seeder] Created ${createdListings.length} luxury listings.`);

    // Sample reviews for first 6 listings
    const sampleReviewsData = [
      {
        rating: 5,
        subRatings: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'An ethereal architectural experience! The sunsets over the ocean from the glass terrace were simply unforgettable. Flawless hospitality and ultra-clean amenities.',
      },
      {
        rating: 5,
        subRatings: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 4 },
        comment: 'Words cannot describe waking up to the bamboo grove rustling in the morning breeze. The natural onsen bath was deeply rejuvenating after long days exploring.',
      },
      {
        rating: 5,
        subRatings: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'Spectacular views of the Matterhorn from the heated pool. Everything about this chalet screams bespoke craftsmanship.',
      },
      {
        rating: 4,
        subRatings: { cleanliness: 5, accuracy: 4, communication: 5, location: 5, value: 4 },
        comment: 'Stunning cliffside location in Oia. The plunge pool and sunset vistas were breathtaking. Can’t wait to come back!',
      },
      {
        rating: 5,
        subRatings: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5 },
        comment: 'The bamboo engineering is magnificent. Suspended above the river valley with organic breakfasts served every morning. A true hidden gem.',
      },
    ];

    for (let i = 0; i < Math.min(sampleReviewsData.length, createdListings.length); i++) {
      const listing = createdListings[i];
      const author = i % 2 === 0 ? guest1 : guest2;
      const reviewInfo = sampleReviewsData[i];

      await Review.create({
        listing: listing._id,
        author: author._id,
        rating: reviewInfo.rating,
        subRatings: reviewInfo.subRatings,
        comment: reviewInfo.comment,
      });

      listing.ratingAvg = reviewInfo.rating;
      listing.reviewCount = 1;
      await listing.save();
    }
    console.log('[Seeder] Populated initial reviews and updated listing averages.');

    // Create a demo booking for listing 0 (to verify overlap prevention and guest dashboard)
    const now = new Date();
    const futureCheckIn = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10);
    const futureCheckOut = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);

    const pastCheckIn = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10);
    const pastCheckOut = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

    await Booking.create({
      listing: createdListings[0]._id,
      guest: guest1._id,
      checkIn: futureCheckIn,
      checkOut: futureCheckOut,
      nightlyRate: createdListings[0].pricePerNight,
      cleaningFee: createdListings[0].cleaningFee,
      serviceFee: Math.round(createdListings[0].pricePerNight * 4 * 0.14),
      totalPrice: createdListings[0].pricePerNight * 4 + createdListings[0].cleaningFee + Math.round(createdListings[0].pricePerNight * 4 * 0.14),
      guestsCount: 2,
      status: 'confirmed',
      itineraryCode: 'HM-PACIFIC-01',
    });

    await Booking.create({
      listing: createdListings[1]._id,
      guest: guest1._id,
      checkIn: pastCheckIn,
      checkOut: pastCheckOut,
      nightlyRate: createdListings[1].pricePerNight,
      cleaningFee: createdListings[1].cleaningFee,
      serviceFee: Math.round(createdListings[1].pricePerNight * 4 * 0.14),
      totalPrice: createdListings[1].pricePerNight * 4 + createdListings[1].cleaningFee + Math.round(createdListings[1].pricePerNight * 4 * 0.14),
      guestsCount: 2,
      status: 'completed',
      itineraryCode: 'HM-KYOTO-PAST',
    });

    console.log('[Seeder] Created demo confirmed and completed bookings.');
    console.log('[Seeder] Seeding finished successfully!');

    return {
      users: createdUsers,
      listings: createdListings,
    };
  } catch (err) {
    console.error('[Seeder] Error during seeding:', err);
    throw err;
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await disconnectDB();
      process.exit(1);
    });
}
