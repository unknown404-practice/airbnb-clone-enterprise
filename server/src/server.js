import app from './app.js';
import { connectDB } from './config/db.js';
import Listing from './models/Listing.js';
import { seedDatabase } from './seeds/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const count = await Listing.countDocuments();
    if (count === 0) {
      console.log('[Airbnb Server] Database has 0 listings. Auto-seeding initial data...');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log(`[Airbnb Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    const shutdown = () => {
      console.log('[Airbnb Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Airbnb Server] Closed HTTP server.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Airbnb Server] Failed to start:', err.message);
    process.exit(1);
  }
};

startServer();
