import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, origin);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Airbnb Clone Backend API Server is running',
    frontendApp: process.env.CLIENT_URL || 'http://localhost:5173',
    endpoints: {
      health: 'GET /api/health',
      listings: 'GET /api/listings',
      singleListing: 'GET /api/listings/:id',
      authLogin: 'POST /api/auth/login',
      authRegister: 'POST /api/auth/register',
      authProfile: 'GET /api/auth/me',
      bookings: 'GET /api/bookings/my-trips',
      reviews: 'GET /api/reviews/listing/:listingId',
      seedData: 'POST /api/seed'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed trigger endpoint
app.post('/api/seed', async (req, res, next) => {
  try {
    const { seedDatabase } = await import('./seeds/seed.js');
    const result = await seedDatabase();
    res.status(200).json({ success: true, message: 'Database seeded successfully', data: result });
  } catch (err) {
    next(err);
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
