import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone';

  try {
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] Connected successfully to MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`[Database] Direct MongoDB connection failed (${err.message}). Starting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected successfully to MongoMemoryServer at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to initialize MongoMemoryServer:', memErr.message);
      throw memErr;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[Database] Disconnected cleanly');
  } catch (error) {
    console.error('[Database] Disconnection error:', error);
  }
};
