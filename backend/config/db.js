const mongoose = require('mongoose');

/**
 * Global cache for MongoDB connection across serverless invocations.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Reuse existing connection ONLY if readyState is 1 (connected)
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If state is not connected, reset cached values
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables.');
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 5,
      socketTimeoutMS: 20000,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch((err) => {
      console.error(`MongoDB connection error: ${err.message}`);
      cached.promise = null;
      cached.conn = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
};

module.exports = connectDB;
